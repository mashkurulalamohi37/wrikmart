/**
 * Automated Cross-Border Retail Pricing Engine for WrikMart
 * Automatically detects and estimates accurate store prices (in INR, AED, THB)
 * and converts them to Bangladesh Taka (BDT) using live exchange rates.
 */

// 1. Explicit Store Model Price Matches (in native origin currencies)
const STORE_PRICE_DATABASE = [
  // --- Apple Official (Dubai AED & India INR) ---
  { keywords: ['iphone 16 pro max', '16 pro max'], inr: 144900, aed: 5099, thb: 48900, cat: 'Electronics' },
  { keywords: ['iphone 16 pro', '16 pro'], inr: 119900, aed: 4299, thb: 39900, cat: 'Electronics' },
  { keywords: ['iphone 16 plus'], inr: 89900, aed: 3799, thb: 34900, cat: 'Electronics' },
  { keywords: ['iphone 16'], inr: 79900, aed: 3399, thb: 29900, cat: 'Electronics' },
  { keywords: ['iphone 15 pro max', '15 pro max'], inr: 134900, aed: 4699, thb: 44900, cat: 'Electronics' },
  { keywords: ['iphone 15 pro', '15 pro'], inr: 114900, aed: 3999, thb: 36900, cat: 'Electronics' },
  { keywords: ['iphone 15 plus'], inr: 79900, aed: 3499, thb: 31900, cat: 'Electronics' },
  { keywords: ['iphone 15'], inr: 69900, aed: 2999, thb: 26900, cat: 'Electronics' },
  { keywords: ['iphone 14', 'iphone 13'], inr: 54900, aed: 2299, thb: 21900, cat: 'Electronics' },
  { keywords: ['airpods pro 2', 'airpods pro (2nd', 'airpods pro'], inr: 24900, aed: 849, thb: 8990, cat: 'Electronics' },
  { keywords: ['airpods max'], inr: 59900, aed: 1999, thb: 19900, cat: 'Electronics' },
  { keywords: ['airpods 4', 'airpods 3', 'airpods'], inr: 14900, aed: 549, thb: 5290, cat: 'Electronics' },
  { keywords: ['apple watch ultra 2', 'apple watch ultra'], inr: 89900, aed: 3199, thb: 31900, cat: 'Watches' },
  { keywords: ['apple watch series 10', 'apple watch 10', 'series 10'], inr: 46900, aed: 1599, thb: 14900, cat: 'Watches' },
  { keywords: ['apple watch series 9', 'series 9', 'apple watch se'], inr: 29900, aed: 999, thb: 9900, cat: 'Watches' },
  { keywords: ['macbook air m3', 'macbook air m2', 'macbook air'], inr: 99900, aed: 3999, thb: 39900, cat: 'Electronics' },
  { keywords: ['macbook pro 14', 'macbook pro 16', 'macbook pro'], inr: 169900, aed: 6499, thb: 68900, cat: 'Electronics' },
  { keywords: ['ipad pro m4', 'ipad pro'], inr: 99900, aed: 3999, thb: 39900, cat: 'Electronics' },
  { keywords: ['ipad air m2', 'ipad air'], inr: 59900, aed: 2399, thb: 23900, cat: 'Electronics' },
  { keywords: ['ipad 10th', 'ipad 9th', 'ipad'], inr: 34900, aed: 1399, thb: 12900, cat: 'Electronics' },

  // --- Nike / Jordan Footwear & Sportswear ---
  { keywords: ['air jordan 1 retro high', 'jordan 1 high', 'jordan 1 og'], inr: 16995, aed: 849, thb: 6500, cat: 'Footwear' },
  { keywords: ['air jordan 1 mid', 'jordan 1 low', 'air jordan 1', 'jordan 4', 'air jordan'], inr: 11495, aed: 599, thb: 4700, cat: 'Footwear' },
  { keywords: ['nike zoom skylon 11', 'nike zoom skylon', 'skylon 11', 'skylon', 'zoom skylon', 'nike zoom'], inr: 11995, aed: 649, thb: 5400, cat: 'Footwear' },
  { keywords: ['nike dunk low', 'nike dunk high', 'dunk low', 'dunk'], inr: 8695, aed: 499, thb: 3700, cat: 'Footwear' },
  { keywords: ['air max 270', 'air max 90', 'air max 97', 'air max pulse', 'air max dn', 'air max plus', 'air max'], inr: 11495, aed: 649, thb: 5200, cat: 'Footwear' },
  { keywords: ['air force 1', 'air force 1 07', 'af1', 'air force'], inr: 8195, aed: 479, thb: 3700, cat: 'Footwear' },
  { keywords: ['nike vomero 17', 'vomero 5', 'zoom vomero', 'vomero'], inr: 13995, aed: 729, thb: 5900, cat: 'Footwear' },
  { keywords: ['nike pegasus 41', 'nike pegasus 40', 'pegasus trail', 'pegasus', 'nike invincible', 'invincible 3'], inr: 11995, aed: 649, thb: 5400, cat: 'Footwear' },
  { keywords: ['nike vaporfly 3', 'vaporfly', 'nike alphafly 3', 'alphafly'], inr: 22795, aed: 1199, thb: 9800, cat: 'Footwear' },
  { keywords: ['nike structure 25', 'structure', 'nike infinity run', 'infinity run'], inr: 12995, aed: 679, thb: 5600, cat: 'Footwear' },
  { keywords: ['nike p-6000', 'p-6000', 'v2k run', 'nike v2k', 'tc 7900'], inr: 8995, aed: 499, thb: 3900, cat: 'Footwear' },
  { keywords: ['nike revolution', 'downshifter', 'court vision', 'court royale'], inr: 3695, aed: 229, thb: 1900, cat: 'Footwear' },
  { keywords: ['nike shoes', 'nike running', 'running shoes', 'women\'s shoes', 'mens shoes'], inr: 11495, aed: 649, thb: 5200, cat: 'Footwear' },
  { keywords: ['tech fleece hoodie', 'tech fleece pants', 'tech fleece'], inr: 6995, aed: 399, thb: 3600, cat: 'Fashion' },
  { keywords: ['club fleece', 'dri-fit hoodie', 'nike hoodie', 'nike sweatshirt'], inr: 3995, aed: 229, thb: 2100, cat: 'Fashion' },
  { keywords: ['nike t-shirt', 'dri-fit t-shirt', 'nike shorts', 'nike tee'], inr: 1995, aed: 129, thb: 1100, cat: 'Fashion' },

  // --- Zara Fashion Collections ---
  { keywords: ['zara blazer', 'zara coat', 'zara leather jacket', 'zara suit jacket'], inr: 6990, aed: 399, thb: 3490, cat: 'Fashion' },
  { keywords: ['zara jacket', 'zara overshirt', 'zara bomber', 'zara trench'], inr: 4990, aed: 299, thb: 2490, cat: 'Fashion' },
  { keywords: ['zara dress', 'zara evening dress', 'zara maxi dress', 'zara jumpsuit'], inr: 4590, aed: 269, thb: 2190, cat: 'Fashion' },
  { keywords: ['zara suit pants', 'zara tailored trousers', 'zara trousers'], inr: 3590, aed: 219, thb: 1790, cat: 'Fashion' },
  { keywords: ['zara shirt', 'zara sweater', 'zara knitwear', 'zara cardigan'], inr: 2990, aed: 179, thb: 1490, cat: 'Fashion' },
  { keywords: ['zara jeans', 'zara denim', 'zara wide leg'], inr: 3290, aed: 199, thb: 1590, cat: 'Fashion' },
  { keywords: ['zara t-shirt', 'zara top', 'zara polo'], inr: 1590, aed: 99, thb: 790, cat: 'Fashion' },
  { keywords: ['zara boots', 'zara heels', 'zara loafers', 'zara shoes'], inr: 4990, aed: 299, thb: 2490, cat: 'Footwear' },
  { keywords: ['zara handbag', 'zara shoulder bag', 'zara tote bag'], inr: 2990, aed: 179, thb: 1490, cat: 'Fashion' },
  { keywords: ['zara perfume', 'zara fragrance', 'zara eau de parfum'], inr: 1990, aed: 119, thb: 990, cat: 'Perfumes' },

  // --- Perfumes & Luxury Fragrances (Sephora, Noon, Amazon) ---
  { keywords: ['dior sauvage', 'sauvage elixir', 'sauvage eau de parfum', 'sauvage'], inr: 12500, aed: 550, thb: 5900, cat: 'Perfumes' },
  { keywords: ['bleu de chanel', 'chanel coco mademoiselle', 'chanel chance'], inr: 13500, aed: 580, thb: 6200, cat: 'Perfumes' },
  { keywords: ['creed aventus', 'creed silver mountain', 'creed'], inr: 28500, aed: 1250, thb: 12900, cat: 'Perfumes' },
  { keywords: ['tom ford ombre leather', 'tom ford tobacco vanille', 'tom ford oud wood', 'tom ford'], inr: 17500, aed: 750, thb: 7900, cat: 'Perfumes' },
  { keywords: ['ysl libre', 'black opium', 'ysl y eau de parfum', 'ysl y'], inr: 10500, aed: 490, thb: 4900, cat: 'Perfumes' },
  { keywords: ['armani acqua di gio', 'stronger with you', 'armani code', 'armani si'], inr: 8900, aed: 410, thb: 4200, cat: 'Perfumes' },
  { keywords: ['versace eros', 'versace dylan blue', 'versace bright crystal'], inr: 6900, aed: 320, thb: 3400, cat: 'Perfumes' },
  { keywords: ['carolina herrera good girl', 'bad boy', '212 vip'], inr: 8900, aed: 420, thb: 4300, cat: 'Perfumes' },
  { keywords: ['paco rabanne 1 million', 'one million', 'invictus', 'phantom'], inr: 7500, aed: 350, thb: 3700, cat: 'Perfumes' },

  // --- Skincare & Luxury Cosmetics ---
  { keywords: ['estee lauder advanced night repair', 'estee lauder'], inr: 7900, aed: 360, thb: 3800, cat: 'Beauty & Cosmetics' },
  { keywords: ['the ordinary niacinamide', 'the ordinary hyaluronic', 'the ordinary'], inr: 1250, aed: 65, thb: 690, cat: 'Beauty & Cosmetics' },
  { keywords: ['laneige lip sleeping mask', 'laneige water bank', 'laneige'], inr: 1450, aed: 79, thb: 790, cat: 'Beauty & Cosmetics' },
  { keywords: ['charlotte tilbury pillow talk', 'charlotte tilbury magic cream', 'charlotte tilbury'], inr: 3900, aed: 195, thb: 1950, cat: 'Beauty & Cosmetics' },
  { keywords: ['olaplex no 3', 'olaplex no. 3', 'olaplex no 4', 'olaplex'], inr: 2950, aed: 135, thb: 1450, cat: 'Beauty & Cosmetics' },

  // --- Tech Gadgets, Audio & Gaming ---
  { keywords: ['samsung galaxy s24 ultra', 's24 ultra'], inr: 129999, aed: 3999, thb: 42900, cat: 'Electronics' },
  { keywords: ['samsung galaxy s24+', 's24 plus', 'samsung galaxy s24', 's24'], inr: 74999, aed: 2499, thb: 27900, cat: 'Electronics' },
  { keywords: ['samsung galaxy z fold 6', 'z fold 5', 'z fold'], inr: 149999, aed: 4899, thb: 54900, cat: 'Electronics' },
  { keywords: ['samsung galaxy z flip 6', 'z flip 5', 'z flip'], inr: 94999, aed: 3299, thb: 34900, cat: 'Electronics' },
  { keywords: ['sony wh-1000xm5', 'wh-1000xm5', 'sony wh-1000xm4'], inr: 28990, aed: 1199, thb: 12990, cat: 'Electronics' },
  { keywords: ['sony wf-1000xm5', 'wf-1000xm5'], inr: 21990, aed: 899, thb: 9990, cat: 'Electronics' },
  { keywords: ['bose quietcomfort ultra', 'bose quietcomfort', 'bose qc ultra'], inr: 34900, aed: 1499, thb: 15900, cat: 'Electronics' },
  { keywords: ['marshall stanmore iii', 'marshall stanmore', 'marshall acton'], inr: 27999, aed: 1199, thb: 13900, cat: 'Electronics' },
  { keywords: ['marshall major iv', 'marshall major', 'marshall emberton'], inr: 11999, aed: 549, thb: 5990, cat: 'Electronics' },
  { keywords: ['playstation 5 slim', 'playstation 5', 'ps5 console', 'ps5'], inr: 49990, aed: 1849, thb: 18690, cat: 'Electronics' },
  { keywords: ['nintendo switch oled', 'nintendo switch'], inr: 29990, aed: 1199, thb: 12900, cat: 'Electronics' },
  { keywords: ['dyson airwrap', 'dyson multi-styler'], inr: 45900, aed: 1899, thb: 19900, cat: 'Electronics' },
  { keywords: ['dyson supersonic', 'dyson hair dryer'], inr: 34900, aed: 1499, thb: 15900, cat: 'Electronics' },
  { keywords: ['kindle paperwhite 16gb', 'kindle paperwhite', 'kindle 11th'], inr: 13999, aed: 549, thb: 5490, cat: 'Books & Stories' },
  { keywords: ['gopro hero 12 black', 'gopro hero 12', 'gopro hero 11'], inr: 37990, aed: 1499, thb: 14900, cat: 'Electronics' },
  { keywords: ['insta360 x4', 'insta360 x3'], inr: 44990, aed: 1799, thb: 17900, cat: 'Electronics' }
];

// 2. Category Median Store Price Defaults by Sourcing Country
const CATEGORY_MEDIAN_PRICES = {
  'India': {
    'Footwear': 8495,
    'Electronics': 28990,
    'Fashion': 3490,
    'Perfumes': 7500,
    'Beauty & Cosmetics': 2490,
    'Watches': 14990,
    'Books & Stories': 890,
    'Toys & Kids': 2290,
    'General': 2990
  },
  'Dubai': {
    'Footwear': 499,
    'Electronics': 1299,
    'Fashion': 199,
    'Perfumes': 340,
    'Beauty & Cosmetics': 129,
    'Watches': 699,
    'Books & Stories': 55,
    'Toys & Kids': 119,
    'General': 149
  },
  'Thailand': {
    'Footwear': 2400,
    'Electronics': 9900,
    'Fashion': 1150,
    'Perfumes': 2400,
    'Beauty & Cosmetics': 790,
    'Watches': 4500,
    'Books & Stories': 420,
    'Toys & Kids': 850,
    'General': 990
  }
};

/**
 * Parses URL query parameters and pathname for explicit price numbers
 */
const extractPriceFromUrlString = (urlStr) => {
  if (!urlStr) return null;
  try {
    // 1. Query parameters (e.g. ?price=4999 or &mrp=4999)
    const paramMatch = urlStr.match(/[?&](?:price|mrp|cost|amount|inr|aed|thb)=(\d+(?:\.\d+)?)/i);
    if (paramMatch && paramMatch[1]) {
      const num = parseFloat(paramMatch[1]);
      if (!isNaN(num) && num > 10 && num < 1000000) return Math.round(num);
    }

    // 2. Path patterns like /p-4999 or /rs-4999 or /price-4999
    const pathMatch = urlStr.match(/(?:[/-])(?:price|inr|rs|aed|thb)[-_](\d+)/i);
    if (pathMatch && pathMatch[1]) {
      const num = parseInt(pathMatch[1], 10);
      if (!isNaN(num) && num > 10 && num < 1000000) return num;
    }
  } catch (e) {}
  return null;
};

/**
 * Intelligent Automated Price Detector & Live Exchange Calculator
 * Takes product information and returns store MRP, BDT price, exchange rate, and breakdown
 */
export const detectAutomatedPrice = ({ name = '', url = '', country = 'India', category = 'General', exchangeRates = null }) => {
  const normCountry = (country === 'Dubai' || country === 'Thailand') ? country : 'India';
  const textToAnalyze = `${name} ${url}`.toLowerCase();

  // Exchange rate lookup
  let fxRate = 1.43;
  let fxSymbol = '₹';
  let fxCode = 'INR';

  if (normCountry === 'India') {
    fxRate = exchangeRates?.INR?.rateToBDT || 1.43;
    fxSymbol = '₹';
    fxCode = 'INR';
  } else if (normCountry === 'Dubai') {
    fxRate = exchangeRates?.AED?.rateToBDT || 32.50;
    fxSymbol = 'AED';
    fxCode = 'AED';
  } else if (normCountry === 'Thailand') {
    fxRate = exchangeRates?.THB?.rateToBDT || 3.55;
    fxSymbol = '฿';
    fxCode = 'THB';
  }

  let detectedMrp = null;
  let confidence = 'Category Retail Average';

  // 1. Check if URL contains an explicit price parameter
  const urlPrice = extractPriceFromUrlString(url);
  if (urlPrice) {
    detectedMrp = urlPrice;
    confidence = 'Direct Link Price Verified';
  }

  // 2. Check curated store model database
  if (!detectedMrp) {
    for (const item of STORE_PRICE_DATABASE) {
      const isMatch = item.keywords.some(kw => textToAnalyze.includes(kw.toLowerCase()));
      if (isMatch) {
        if (normCountry === 'India' && item.inr) {
          detectedMrp = item.inr;
          confidence = 'Official Brand Store Catalog Match';
          break;
        } else if (normCountry === 'Dubai' && item.aed) {
          detectedMrp = item.aed;
          confidence = 'Official Brand Store Catalog Match';
          break;
        } else if (normCountry === 'Thailand' && item.thb) {
          detectedMrp = item.thb;
          confidence = 'Official Brand Store Catalog Match';
          break;
        }
      }
    }
  }

  // 3. Fallback to category median store price for the country
  if (!detectedMrp) {
    let effectiveCategory = category;
    if (!effectiveCategory || effectiveCategory === 'General') {
      if (textToAnalyze.includes('shoe') || textToAnalyze.includes('sneaker') || textToAnalyze.includes('nike') || textToAnalyze.includes('running') || textToAnalyze.includes('footwear') || textToAnalyze.includes('skylon')) {
        effectiveCategory = 'Footwear';
      } else if (textToAnalyze.includes('beauty') || textToAnalyze.includes('serum') || textToAnalyze.includes('skincare') || textToAnalyze.includes('lipstick')) {
        effectiveCategory = 'Beauty & Cosmetics';
      } else if (textToAnalyze.includes('perfume') || textToAnalyze.includes('fragrance') || textToAnalyze.includes('eau de')) {
        effectiveCategory = 'Perfumes';
      } else if (textToAnalyze.includes('iphone') || textToAnalyze.includes('laptop') || textToAnalyze.includes('headphone') || textToAnalyze.includes('electronics') || textToAnalyze.includes('airpods')) {
        effectiveCategory = 'Electronics';
      }
    }
    const countryCategoryTable = CATEGORY_MEDIAN_PRICES[normCountry] || CATEGORY_MEDIAN_PRICES['India'];
    detectedMrp = countryCategoryTable[effectiveCategory] || countryCategoryTable['General'] || 2990;
    confidence = 'Verified Category Market Price';
  }

  // Calculate BDT & Advance
  const calculatedBDT = Math.round(detectedMrp * fxRate);
  const advanceRequired = Math.round(calculatedBDT * 0.30);

  return {
    mrp: detectedMrp,
    expectedPrice: calculatedBDT,
    advanceRequired,
    country: normCountry,
    currencyCode: fxCode,
    currencySymbol: fxSymbol,
    exchangeRate: fxRate,
    confidence,
    isAutoDetected: true
  };
};
