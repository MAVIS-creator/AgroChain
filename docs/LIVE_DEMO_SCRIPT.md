# AgroChain Live Demo Script (Step-by-Step Runbook)

Follow this runbook for a reliable, comprehensive live demonstration of **AgroChain: Smart Cassava and Maize Value Chain Ecosystem**.

---

## 1. Terminal Startup Sequence

### Terminal 1 (Repo Root - API & Data Services):
```powershell
# Build dual-crop dataset
npm run dataset:build

# Start data & telemetry API
npm run api:dataset
```

### Terminal 2 (Repo Root - Contract Deployment):
```powershell
# Compile smart contracts
npm run compile

# Deploy AgroChain to Ganache
$env:GANACHE_PRIVATE_KEY="0xYOUR_GANACHE_ACCOUNT_KEY"
npm run deploy
```

### Terminal 3 (Web UI):
```powershell
cd ui
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 2. MetaMask Configuration

1. Network Name: `Ganache Local`
2. RPC URL: `http://127.0.0.1:7545`
3. Chain ID: `1337`
4. Currency Symbol: `ETH`
5. Import at least 3 Ganache private keys to demonstrate multi-stakeholder roles (e.g. Admin, Farmer, Processor).

---

## 3. Step-by-Step UI Demonstration

### Step 1: Connect Admin Wallet & Assign Roles
1. In the header, click **Connect Wallet** and connect the Ganache deployer account.
2. Navigate to **Administration**:
   - Register Farmer: Enter second account address, role `FARMER`, name `Green Valley Cooperative`, click **Commit On-Chain Role Assignment**.
   - Register Processor: Enter third account address, role `PROCESSOR`, name `Premier Agro Mill`.
3. Confirm transactions in MetaMask.

---

### Step 2: Log Crop Batches (Cassava & Maize)
1. Switch MetaMask account to the **Farmer** address.
2. Navigate to **Dashboard**:
   - **Cassava Batch**:
     - Batch ID: `20261001`
     - Crop Commodity: `Cassava Roots`
     - Quantity: `3500` (Unit: `kg`)
     - Farm Origin: `Ibadan, Oyo State`
     - Click **Mint Crop Batch On-Chain**.
   - **Maize Batch**:
     - Batch ID: `20262001`
     - Crop Commodity: `Maize Grain`
     - Quantity: `8000` (Unit: `kg`)
     - Farm Origin: `Kaduna Agricultural Cluster`
     - Click **Mint Crop Batch On-Chain**.
3. Batches appear immediately in the **Recent Batches on Ledger** table.

---

### Step 3: Agro-Input Authenticity
1. Navigate to **Inputs**:
   - Register Seed: Input ID `SEED-MZ-2026`, Category `Certified Hybrid Seed`, Crop `Maize`, Cert Ref `NASC-CERT-88`. Click **Register On-Chain**.
   - Link Input: Batch ID `20262001`, Input ID `SEED-MZ-2026`. Click **Link Input to Provenance**.
2. Shows on-chain status updated to `INPUT_VERIFIED`.

---

### Step 4: Storage & IoT Telemetry
1. Navigate to **Storage & Processing**:
   - Batch ID: `20261001`
   - Facility: `Oyo Central Silos`
   - Click **Simulate** to generate an automated IoT reading.
2. The IoT Telemetry Log shows temperature, humidity, and threshold status (e.g. Optimal vs. Threshold Breach if >28°C or >70% RH).

---

### Step 5: Industrial Processing & Quality Certification
1. In **Storage & Processing**:
   - Batch ID: `20261001`
   - Processed Output: `High Quality Cassava Flour (HQCF)`
   - Quantity: `1200 kg`
   - Notes: `Milled, dried to 10% moisture.`
   - Click **Record Processing On-Chain**.
2. Stamping Quality Certificate:
   - Target Batch: `20261001`
   - Grade: `Grade A Premium Export`
   - Outcome: `PASSED`
   - Notes: `Aflatoxin < 4ppb, Cyanide compliant.`
   - Click **Issue Quality Certificate**.

---

### Step 6: Logistics & Transportation
1. Navigate to **Logistics**:
   - Shipment ID: `9001`
   - Batch ID: `20261001`
   - Transporter Address: Enter transporter wallet address.
   - Destination: `Lagos Port Terminal`
   - Click **Dispatch Shipment**.
2. Custody automatically transfers to transporter, and stage becomes `IN_TRANSIT`.
3. Click **Confirm Delivery** with recipient address to complete delivery (`DELIVERED`).

---

### Step 7: B2B Marketplace & Simulated Settlement
1. Navigate to **Marketplace**:
   - Create Listing: Batch ID `20262001`, Qty `8000 kg`, Price `₦380 / kg`. Click **Publish Marketplace Listing**.
   - Place Order: Listing `#501`, Qty `4000 kg`. Click **Create Procurement Order**.
   - Switch to **Simulated Payments** tab: Click **Record & Settle Payment** (demonstrator simulated settlement).
   - Switch to **Simulated Agricultural Insurance** tab: View policy issuance and indemnity claim workflow.

---

### Step 8: Public Consumer QR Verification (No Wallet Login)
1. Navigate to **Verify Product**:
   - Enter Batch ID: `20261001`
   - Click **Verify Batch**.
2. Highlights:
   - Displays the cryptographic verification seal.
   - Displays full provenance: Cassava Roots → HQCF → Grade A Export.
   - Displays dynamic pure SVG QR code (`AGROCHAIN-QR-20261001`).
   - Sensitive stakeholder addresses are masked for OSINT security.
   - Click **Print Certificate** or **Share Link**.

---

### Step 9: Analytics & AI-Ready Risk Engine
1. Navigate to **Analytics**:
   - Inspect dual-crop volume breakdown (Cassava vs Maize).
   - Under **AI-Ready Risk Scoring Engine**, enter Batch `20261001` and click **Run Risk Analysis**.
   - Displays risk score, category (LOW / MEDIUM / HIGH), and transparent contributing factors.
