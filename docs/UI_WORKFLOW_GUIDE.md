# AgroChain UI Workflow & Operations Guide

This guide details every view, form, control, and permission boundary in the **AgroChain: Blockchain-Powered Smart Cassava and Maize Value Chain Ecosystem**.

---

## 1. Data Architecture & Lanes

AgroChain synchronizes two authoritative data lanes:

- **On-Chain Ledger Lane**: Smart contract transactions executed on Ganache Local (Chain ID `1337`). Controls batch provenance, custody transfers, role authorization, and stage mutations.
- **Off-Chain Telemetry Lane**: Local API server endpoints (`http://127.0.0.1:3030`). Manages empirical production datasets, IoT storage observation simulation, deterministic risk scoring, and observable cybersecurity telemetry.

---

## 2. Navigation Architecture (9 Core Views)

| View | Purpose | Primary Authorized Roles |
| :--- | :--- | :--- |
| **Dashboard** | Value chain KPIs, quick batch minting, custody transfers, and recent ledger tables. | All active stakeholders, Farmers |
| **Traceability** | Reconstructs chronological value-chain journey across all lifecycle stages. | All stakeholders |
| **Inputs** | Agro-input registration, regulatory verification, and farm batch linking. | Input Suppliers, Regulators, Extension Officers, Farmers |
| **Storage & Processing** | IoT climate monitoring, processing event logging, and quality certification. | Storage Operators, Processors, Regulators |
| **Logistics** | Shipment dispatch, transporter custody acceptance, and delivery confirmation. | Transporters, Distributors, Farmers |
| **Marketplace** | Direct B2B crop listings, procurement orders, simulated payments, and insurance. | Farmers, Processors, Financial Institutions |
| **Analytics** | Dual-crop volume breakdown, post-harvest-loss metrics, and deterministic AI risk engine. | All stakeholders, Researchers, Analysts |
| **Administration** | Stakeholder digital identity registry, status toggles, and 11-role assignment. | Deployer Administrator |
| **Verify Product** | Public consumer verification portal with dynamic SVG QR code generation. | Public (No wallet required) |

---

## 3. View-by-View Operations

### A. Dashboard
- **Log New Crop Batch Form**:
  - Fields: `Batch ID`, `Crop Commodity` (Cassava Roots or Maize Grain), `Quantity`, `Unit` (kg, tonnes, bags), `Farm Origin Cluster`, `Initial Quality Grade`.
  - Button: `Mint Crop Batch On-Chain`.
  - Behavior: Calls `createBatch(...)` on-chain. Validates unique ID and positive quantity.
- **Transfer Custody**:
  - Fields: `Batch ID`, `New Custodian Wallet`.
  - Button: `Transfer Custody On-Chain`.
  - Enforces: Caller must be active current custodian.
- **Advance Lifecycle Stage**:
  - Buttons for forward progression: `INPUT_VERIFIED`, `FARM_RECORDED`, `HARVESTED`, `STORED`, `PROCESSED`, `IN_TRANSIT`, `DELIVERED`.
  - Enforces: Forward-only progression.

### B. Traceability
- **Search Bar**: Enter any active Batch ID.
- **Outputs**:
  - Provenance Summary card (Commodity, farm origin, quantity, current custodian).
  - 8-stage visual progress completion bar.
  - Chronological blockchain event journey with block numbers and transaction hashes.

### C. Inputs (Agro-Input Authenticity)
- **Register Agro-Input Form**:
  - Fields: `Input ID`, `Supplier Name`, `Category` (Seed, Cuttings, Fertilizer), `Applicability` (Cassava or Maize), `Cert Reference`.
  - Restricted to: `INPUT_SUPPLIER` and `ADMINISTRATOR`.
- **Verify Input Form**:
  - Certifies input compliance with national seed standards.
  - Restricted to: `REGULATOR`, `EXTENSION_OFFICER`, and `ADMINISTRATOR`.
- **Link Input to Batch**:
  - Links verified input ID with a crop batch, advancing stage to `INPUT_VERIFIED`.

### D. Storage & Processing
- **IoT Storage Logging**:
  - Fields: `Batch ID`, `Storage Facility`, `Temperature (°C)`, `Humidity (% RH)`.
  - Action: `Log Reading` or `Simulate` (triggers automated API simulated reading).
  - Telemetry Log highlights **Threshold Breaches** in red if temperature > 28°C or humidity > 70%.
- **Processing Event**:
  - Fields: `Source Batch ID`, `Processed Output Product` (HQCF, Starch, Garri, Maize Flour, Grits, Feed), `Output Quantity`, `Unit`, `Notes`.
  - Restricted to: `PROCESSOR`. Advances stage to `PROCESSED`.
- **Quality Certification**:
  - Fields: `Target Batch ID`, `Assigned Grade`, `Official Certificate Ref`, `Outcome` (PASSED / FAILED), `Safety Criteria & Notes`.
  - Restricted to: `REGULATOR` and `EXTENSION_OFFICER`.

### E. Logistics
- **Create & Dispatch Shipment**:
  - Fields: `Shipment ID`, `Batch ID`, `Transporter Wallet Address`, `Origin Location`, `Destination`.
  - Behavior: Updates batch custodian to Transporter and advances stage to `IN_TRANSIT`.
- **Confirm Delivery**:
  - Fields: `Shipment ID`, `Recipient / Consignee Address`.
  - Behavior: Marks shipment `DELIVERED`, updates batch custodian to recipient, and advances stage to `DELIVERED`.

### F. Marketplace
- **Create Listing**:
  - Fields: `Listing ID`, `Batch ID`, `Quantity`, `Unit`, `Price Per Unit (SIM-NGN)`, `Location`, `Grade`.
  - Restricted to: `FARMER` and `PROCESSOR`.
- **Procurement Order**:
  - Fields: `Order ID`, `Target Listing ID`, `Quantity`.
  - Validates: Quantity <= available listing quantity.
- **Simulated Payment Settlement**:
  - Demonstrator workflow recording payment intent and settlement in `SIM-NGN`. Labeled with demo disclosure.
- **Simulated Agricultural Insurance**:
  - Issue Policy form (`FINANCIAL_INSTITUTION`), File Claim form, Settle Claim action. Labeled as demonstration coverage.

### G. Analytics
- **Volume Metrics**: Dynamic volume counters for Cassava and Maize batches.
- **AI-Ready Risk Scoring Engine**:
  - Enter Batch ID, Crop Type, and Transport Latency.
  - Computes deterministic score (0-100), risk category (LOW / MEDIUM / HIGH), and contributing environmental factors.
  - Transparently labeled as deterministic prototype evaluation.
- **Empirical Regional Agricultural Dataset**:
  - Sourced from Our World in Data with regional breakdown.

### H. Administration
- **Register & Assign Role**:
  - Fields: `User Wallet Address`, `Organization Name`, `Role` (all 11 roles supported), `Status` (ACTIVE / SUSPENDED).
  - Restricted to deployer admin address.
- **Network Controls**:
  - `Sync Blockchain State` and `Reload Empirical Dataset Telemetry`.

### I. Verify Product (Public Consumer Portal)
- **Public Accessibility**: Operates cleanly without wallet connection.
- **Instant Cryptographic Provenance**: Farm origin, crop commodity, processing details, quality seal.
- **Dynamic Pure SVG QR Code**: Compatible with standard camera scanners.
- **OSINT Safeguard**: Internal addresses and node keys are masked.
- **Print & Share**: One-click certificate printing and link sharing.
