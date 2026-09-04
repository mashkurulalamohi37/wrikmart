# WrikMart — Global Pre-Order & Cross-Border Logistics Platform

WrikMart is a modern, responsive cross-border pre-order commerce and logistics web application connecting Bangladeshi customers with on-ground purchasing agents in **India, Dubai, and Thailand**.

## 🚀 Key Modules & Capabilities

1. **👑 Super Admin Management Suite**:
   - 360° Order Management with automated **Gross Profit Margin Calculator** (`Selling Price - Purchase Cost - Delivery = Profit`).
   - Agent operating balance top-ups with live multi-currency conversions (**BDT &rarr; INR / AED / THB**).
   - Delivery Hub & Warehouse management in Dhaka, Chittagong, Delhi, Dubai, and Bangkok.
   - Agent operational expense approvals (Travel, Fuel/Petrol, Salary, Packaging, Misc) with receipt inspections.
   - Form settings, audit logs, and reports.

2. **📱 Overseas Agent Portal (India 🇮🇳, Dubai 🇦🇪, Thailand 🇹🇭)**:
   - **Strict Data Isolation**: Customer Selling Prices, Customer Phone, Name, and Addresses are strictly hidden from agents.
   - Live operating balance with interactive **"Accept Balance"** remittance approval protocol.
   - One-click product sourcing links and specifications.
   - Mandatory **Purchase Price & Printed MRP** entry with tax invoice upload.
   - Destination Delivery Hub drop-off routing (*"Mark as Arrived at Hub"*).

3. **🛍️ Customer Storefront & Pre-Order**:
   - Multi-country selection (India 🇮🇳, Dubai 🇦🇪, Thailand 🇹🇭).
   - Dynamic product URL paste and reference image upload.
   - Multi-product pre-order cart support (`+ Add Another Product`).
   - Automated **25% Advance Payment calculation** with integrated **bKash**, **Nagad**, and **Card** gateways.
   - **9-Stage Live Order Tracking Timeline** from order placement to doorstep delivery.

4. **✨ Responsive Design**:
   - Full-width modern desktop website view.
   - Seamless mobile-first layout transformation on smartphones and tablets.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas-Confetti
- **State Management**: Centralized Context API with LocalStorage persistence
- **Backend Architecture**: Designed for Python FastAPI with PostgreSQL 16 Dual-Ledger Schema (`customer_payments` & `agent_ledger`)

---

## 🏃 Running Locally

```bash
# Clone the repository
git clone https://github.com/mashkurulalamohi37/wrikmart.git

# Navigate to project directory
cd wrikmart

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.
