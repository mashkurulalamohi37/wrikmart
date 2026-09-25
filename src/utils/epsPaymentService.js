/**
 * Easy Payment System (EPS) Bangladesh - Production Grade Payment Service
 * Live Production Merchant Integration for Kririk Toy / WrikMart
 * Licensed Payment System Operator (PSO) by Bangladesh Bank
 */

// Detect environment: use sandbox when running locally (dev)
const IS_DEV = import.meta.env.DEV;

export const DEFAULT_EPS_CONFIG = {
  environment: IS_DEV ? 'sandbox' : 'production',

  // Vite dev-proxy paths (CORS-free)
  liveApiUrl: '/api/eps',
  sandboxApiUrl: '/api/eps-sandbox',

  // Direct API base URLs (for reference / production builds with CORS headers)
  directLiveApiUrl: 'https://pgapi.eps.com.bd',
  directSandboxApiUrl: 'https://sandboxpgapi.eps.com.bd',

  // Hosted payment page URLs (where browser redirects)
  liveGatewayUrl: 'https://pg.eps.com.bd',
  sandboxGatewayUrl: 'https://sandboxpg.eps.com.bd',

  // ── Live credentials (WrikMart Production Integration) ──
  merchantId: '2dcbaad3-46f4-4922-8c0e-3078c50dc1e1',
  storeId: '749c011e-3c97-405c-ac90-8e13695f67b4',
  userName: 'krishnabasaksp@gmail.com',
  password: 'KririkToy8@',
  hashKey: 'FMUNISHOY2lWZXDkririktoy',
  registeredDomain: 'https://wrikmart.com',

  // ── Sandbox credentials (Eps_Demo) ─────────────────────────
  sandboxMerchantId: '',
  sandboxStoreId: '35b518f6-aab7-4af1-b16c-335052e9a55c',
  sandboxUserName: 'xyz.eps@gmail.com',
  sandboxPassword: 'Emon258@',
  sandboxHashKey: 'iRbuoCMiOwQIIXyEvq30l61J+XAq0D/htjKQwiZl4jn7szmMMJTNL7ua0iej2Jtw2ch+D+/uBQ7WgZKcf8hQ8w==',
  sandboxRegisteredDomain: '',
};

/**
 * Computes official HMAC-SHA512 Hash for EPS API headers
 * Algorithm specified by Bangladesh Bank EPS Gateway:
 * 1. UTF8 encode hashKey
 * 2. UTF8 encode message (userName or merchantTransactionId)
 * 3. Compute HMAC-SHA512
 * 4. Return Base64 encoded string
 */
export async function generateEpsHash(message, hashKey) {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(hashKey);
    const messageData = encoder.encode(message);

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: { name: 'SHA-512' } },
      false,
      ['sign']
    );

    const signature = await window.crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      messageData
    );

    const byteArray = new Uint8Array(signature);
    let binary = '';
    for (let i = 0; i < byteArray.byteLength; i++) {
      binary += String.fromCharCode(byteArray[i]);
    }
    return btoa(binary);
  } catch (err) {
    console.error('Failed to calculate EPS HMAC-SHA512 hash:', err);
    throw err;
  }
}

/**
 * Generates a unique 12-to-17 digit Merchant Transaction ID as mandated by EPS specs.
 * Format: YYYYMMDDHHMMSS + 3 random digits
 */
export function generateEpsTransactionId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(100 + Math.random() * 900);
  return `${year}${month}${day}${hours}${mins}${secs}${random}`;
}

/**
 * Helper to execute fetch via the reverse proxy (eliminates CORS).
 * Routes sandbox calls to /api/eps-sandbox, production to /api/eps.
 */
async function fetchWithFallback(endpointPath, options, config) {
  const isSandbox = config.environment === 'sandbox';
  const primaryBase = isSandbox ? config.sandboxApiUrl : config.liveApiUrl;

  try {
    const res = await fetch(`${primaryBase}${endpointPath}`, options);
    return res;
  } catch (primaryErr) {
    console.error('EPS reverse proxy connection error:', primaryErr.message);
    throw new Error(`Unable to reach EPS API proxy (${primaryBase}). Please verify your network connection.`);
  }
}


/**
 * Request EPS Bearer Token (Step 1 of API Guide)
 */
export async function getEpsAuthToken(customConfig = {}) {
  const config = { ...DEFAULT_EPS_CONFIG, ...customConfig };
  const isSandbox = config.environment === 'sandbox';

  // Select credentials based on environment
  const activeUser = isSandbox ? (config.sandboxUserName || config.userName) : config.userName;
  const activePass = isSandbox ? (config.sandboxPassword || config.password) : config.password;
  const activeHash = isSandbox ? (config.sandboxHashKey || config.hashKey) : config.hashKey;

  const hash = await generateEpsHash(activeUser, activeHash);

  const response = await fetchWithFallback('/v1/Auth/GetToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hash': hash
    },
    body: JSON.stringify({
      userName: activeUser,
      password: activePass
    })
  }, config);

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`EPS Auth Error: HTTP ${response.status} - ${errText}`);
  }

  const result = await response.json();
  if (result.errorMessage) {
    throw new Error(`EPS Auth Failed: ${result.errorMessage}`);
  }

  return result.token;
}

/**
 * Initialize EPS Payment Gateway Session (Step 2 of API Guide)
 * Returns { TransactionId, RedirectURL, merchantTransactionId }
 */
export async function createEpsPaymentSession({
  orderNumber,
  merchantTransactionId,
  totalAmount,
  customerInfo = {},
  orderType = 'Stock Order',
  items = []
}, customConfig = {}) {
  const config = { ...DEFAULT_EPS_CONFIG, ...customConfig };
  const isSandbox = config.environment === 'sandbox';

  // Select store/merchant IDs and hash key based on environment
  const storeId = isSandbox ? (config.sandboxStoreId || config.storeId) : config.storeId;
  const merchantId = isSandbox ? (config.sandboxMerchantId || config.merchantId) : config.merchantId;
  const activeHashKey = isSandbox ? (config.sandboxHashKey || config.hashKey) : config.hashKey;

  // Step 1: Obtain Auth Token (uses environment-appropriate credentials)
  const token = await getEpsAuthToken(config);

  // Step 2: Compute x-hash on merchantTransactionId using the active hashKey
  const hash = await generateEpsHash(merchantTransactionId, activeHashKey);

  // Resolve callback base domain: prefer custom config if provided, otherwise dynamically detect active browser origin
  const activeOrigin = (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('null'))
    ? window.location.origin
    : 'https://wrikmart.com';

  const configuredDomain = isSandbox
    ? (config.sandboxRegisteredDomain || config.registeredDomain || '')
    : (config.registeredDomain || '');

  let returnBase = (configuredDomain || '').trim();
  if (!returnBase) {
    returnBase = activeOrigin;
  }
  // Strip trailing slashes
  returnBase = returnBase.replace(/\/+$/, '');

  const successUrl = `${returnBase}/payment/success`;
  const failUrl = `${returnBase}/payment/fail`;
  const cancelUrl = `${returnBase}/payment/cancel`;

  const payload = {
    merchantId,
    storeId,
    CustomerOrderId: String(orderNumber || ('ORD-' + merchantTransactionId)),
    merchantTransactionId: String(merchantTransactionId),
    transactionTypeId: 10, // 10 = Merchant Web Redirect
    financialEntityId: 0,
    transitionStatusId: 0,
    totalAmount: Number(totalAmount) || 1,
    ipAddress: '103.12.45.69',
    version: '1',
    successUrl,
    failUrl,
    cancelUrl,
    customerName: customerInfo.name || 'Valued Customer',
    customerEmail: customerInfo.email || 'customer@wrikmart.com',
    customerAddress: customerInfo.address || 'Dhaka, Bangladesh',
    customerAddress2: customerInfo.address2 || '',
    customerCity: customerInfo.district || 'Dhaka',
    customerState: customerInfo.district || 'Dhaka',
    customerPostcode: customerInfo.postcode || '1200',
    customerCountry: 'BD',
    customerPhone: customerInfo.phone || '01609024005',
    shipmentName: customerInfo.name || 'Valued Customer',
    shipmentAddress: customerInfo.address || 'Dhaka, Bangladesh',
    shipmentCity: customerInfo.district || 'Dhaka',
    shipmentCountry: 'BD',
    shippingMethod: 'Courier',
    noOfItem: String(items.length || 1),
    productName: orderType === 'Pre-Order' ? 'Global Pre-Order Sourcing' : 'Ready Stock Dhaka Express',
    productProfile: 'general',
    productCategory: 'Ecommerce',
    ProductList: items.length > 0 ? items.map((item, idx) => ({
      ProductName: item.name || `Item ${idx + 1}`,
      NoOfItem: String(item.quantity || 1),
      ProductProfile: 'General Goods',
      ProductCategory: item.category || 'Retail',
      ProductPrice: String(item.sellingPrice || item.price || totalAmount)
    })) : [
      {
        ProductName: orderType,
        NoOfItem: '1',
        ProductProfile: 'General Goods',
        ProductCategory: 'Ecommerce',
        ProductPrice: String(totalAmount)
      }
    ]
  };

  const response = await fetchWithFallback('/v1/EPSEngine/InitializeEPS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-hash': hash
    },
    body: JSON.stringify(payload)
  }, config);

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`EPS Session Error: HTTP ${response.status} - ${errText}`);
  }

  const result = await response.json();
  if (result.ErrorMessage && !result.RedirectURL) {
    throw new Error(`EPS Session Failed: ${result.ErrorMessage}`);
  }

  return {
    transactionId: result.TransactionId,
    redirectUrl: result.RedirectURL,
    merchantTransactionId
  };
}

/**
 * Verify EPS Transaction Status (Step 3 of API Guide)
 */
export async function verifyEpsTransaction(merchantTransactionId, customConfig = {}) {
  const config = { ...DEFAULT_EPS_CONFIG, ...customConfig };
  const isSandbox = config.environment === 'sandbox';
  const activeHashKey = isSandbox ? (config.sandboxHashKey || config.hashKey) : config.hashKey;
  const token = await getEpsAuthToken(config);
  const hash = await generateEpsHash(merchantTransactionId, activeHashKey);

  const response = await fetchWithFallback(
    `/v1/EPSEngine/CheckMerchantTransactionStatus?merchantTransactionId=${encodeURIComponent(merchantTransactionId)}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-hash': hash
      }
    },
    config
  );

  if (!response.ok) {
    throw new Error(`EPS Verification Error: HTTP ${response.status}`);
  }

  return await response.json();
}
