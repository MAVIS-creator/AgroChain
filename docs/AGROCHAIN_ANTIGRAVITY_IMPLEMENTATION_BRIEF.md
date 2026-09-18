# AgroChain Antigravity Implementation Brief

## Purpose and scope rule

Transform the existing CassavaTrace repository into **AgroChain: Blockchain-Powered Smart Cassava and Maize Value Chain Ecosystem**.

The supplied AgroChain document is the sole product-scope authority. Do not add modules merely because they are common in agricultural, blockchain, AI, IoT, marketplace, or cybersecurity products. Every implemented capability must map to a requirement in this brief.

Preserve and improve working repository functionality where it supports AgroChain. Replace cassava-only wording and domain assumptions with cassava-and-maize concepts. Keep the application suitable for local demonstration and academic evaluation unless real external service credentials and infrastructure are already present.

## Required product features

### 1. AgroChain identity and responsive access

- Rename CassavaTrace branding, copy, metadata, page titles, icons, and documentation to AgroChain.
- Present AgroChain as a secure digital ecosystem for cassava and maize value chains.
- Maintain a responsive web interface usable on mobile screen sizes.
- Do not claim that a separate native mobile application exists unless one is actually implemented. A responsive web application may serve as the current mobile-access deliverable.

### 2. Permissioned stakeholder and digital identity management

Support these stakeholder types from the source document:

- Administrator
- Farmer
- Input supplier
- Extension officer
- Storage operator
- Processor
- Transporter
- Distributor
- Financial institution
- Regulator
- Consumer

Required behavior:

- Administrators can register or approve stakeholder wallet identities and assign roles.
- Each identity has a wallet address, display name or organization, role, status, and registration timestamp.
- Only authorized roles can perform protected actions.
- Interfaces must expose only actions appropriate to the connected identity.
- All security-sensitive mutations require wallet authorization and validation.

### 3. Cassava and maize product traceability

Track both cassava and maize through the value chain. Each batch must include:

- Unique batch identifier
- Crop type
- Origin or farm location
- Producer identity
- Quantity and unit
- Creation or harvest time
- Current custodian
- Current lifecycle stage
- Quality information
- Transaction or event history

Lifecycle records must cover the document's stated activities:

- Agro-input verification
- Farm activities and production records
- Harvest quantity and quality
- Storage conditions
- Processing and quality certification
- Logistics and transportation
- Distribution or marketing
- Consumer verification

Use forward-only, validated state transitions. Keep a clear immutable audit trail for creation, updates, custody changes, processing, storage, logistics, quality checks, and delivery.

### 4. Agro-input authenticity

- Register seeds, fertilizers, and other agro-inputs with an identifier, supplier, input type, crop applicability, certification or reference information, and verification status.
- Allow authorized stakeholders to verify an input and link it to relevant farm or batch records.
- Display an auditable verification history.

### 5. Storage and IoT monitoring

- Record warehouse or storage-facility observations for batches.
- Include timestamped temperature, humidity, location or facility, and the reporting device or source where applicable.
- Show recent readings, threshold breaches, and batch-linked storage history.
- Provide a local simulation or ingestion endpoint for demonstration when physical IoT hardware is unavailable.
- Label simulated readings clearly; never present simulated data as live hardware data.

### 6. Processing and quality assurance

- Record processing events, outputs, quantities, timestamps, processor identity, and notes.
- Record quality assessments and certifications tied to a batch or processed product.
- Make certification and quality history available in traceability and consumer verification views.

### 7. Logistics and transportation

- Record shipment creation, transporter, origin, destination, dispatch and receipt times, shipment status, and linked batches.
- Record custody transfers and delivery confirmation.
- Expose logistics history as part of the end-to-end batch journey.

### 8. Smart-contract transactions

Use smart contracts for the source document's named transaction categories:

- Supply-chain records and custody transitions
- Procurement
- Payments
- Insurance
- Stakeholder engagement and authorization

For the local demonstration environment, payment and insurance flows may use explicitly labelled simulated settlement states instead of real currency or production insurance providers. Do not claim real settlement when none occurs.

### 9. Agricultural marketplace and market coordination

- Allow authorized sellers to create cassava or maize listings with crop, quantity, unit, price, location, quality information, and availability.
- Allow eligible buyers to create a procurement order or accept an available listing.
- Track order status and associated payment status.
- Preserve an auditable connection among listing, order, batch, buyer, seller, and settlement record.

### 10. Digital payments and insurance records

- Track payment intent, parties, amount, currency or settlement unit, linked order, status, and timestamps.
- Track insurance policy or coverage records, insured batch, provider, coverage status, and claim status.
- Enforce role and state validation.
- Use demonstrable local workflows without inventing external provider integrations.

### 11. QR-code consumer verification

- Generate a QR code or QR-ready public URL for a batch or finished product.
- Provide a consumer-facing verification page that does not require administrative access.
- Show product origin, crop type, journey, quality or certification data, and a clear verification result.
- Do not expose sensitive private stakeholder or security information.

### 12. Analytics and AI-supported risk insights

Provide data-driven views for:

- Crop and batch volumes
- Lifecycle and delivery status
- Storage condition exceptions
- Post-harvest-loss indicators
- Quality and certification outcomes
- Marketplace activity
- Traceability coverage
- Data integrity or verification coverage
- Operational risks

AI-driven analytics must be honest and reproducible. If no trained model exists, implement deterministic risk scoring or a clearly labelled prototype analysis based on stored data. Never label random or hard-coded output as AI.

### 13. Cybersecurity monitoring and incident response

- Record authentication or wallet activity, authorization failures, invalid state changes, suspicious repeated actions, and data-ingestion anomalies where the application can observe them.
- Provide a monitoring dashboard with severity, event type, actor or source, timestamp, status, and evidence summary.
- Allow authorized cybersecurity administrators to acknowledge, investigate, and resolve incidents.
- Preserve an audit trail of incident status changes.
- Do not claim network-wide threat detection beyond the telemetry the application actually collects.

### 14. Reporting and academic evaluation

- Retain and adapt reporting for traceability, transparency, accountability, data integrity, efficiency, and supply-chain performance.
- Include objective mapping that reflects the AgroChain document, not the previous CassavaTrace project wording.
- Support export or printable presentation of relevant records only if it can be implemented using existing application data without adding a new unrelated subsystem.

## Non-software outcomes to represent accurately

The source document also names research publications, patents, innovation products, collaboration, training, internships, grants, and commercialization. These are expected programme outcomes or opportunities, not application modules. Mention them in project documentation if useful, but do not fabricate completed publications, patents, partnerships, grants, internships, or commercial deployments.

## Explicit exclusions and guardrails

- No unrelated social network, chat, forum, news feed, weather service, land marketplace, lending product, token, NFT, cryptocurrency exchange, gamification, or general e-commerce feature.
- No invented integration with banks, insurers, regulators, Niji Agro, IoT vendors, AI providers, or government databases.
- No production claims for local Ganache, simulated IoT readings, prototype analytics, or simulated settlement.
- No storing private keys or secrets in source control, the browser, or application databases.
- No destructive rewrite when an existing component can be safely evolved.
- No removal of working traceability behavior without an equivalent tested AgroChain replacement.
- No scope expansion without written approval.

## Recommended information architecture

Use the smallest navigation structure that covers the required capabilities:

1. Dashboard
2. Traceability
3. Inputs
4. Storage and Processing
5. Logistics
6. Marketplace
7. Analytics
8. Security
9. Administration
10. Verify Product

Navigation and actions should be role-aware. Consumers should primarily use public product verification; administrators should see identity and security controls; operational stakeholders should see only relevant workflows.

## Technical quality standard

- Keep Solidity, React, Vite, Thirdweb, MetaMask, Hardhat, and the local API unless a change is required and justified.
- Refactor the oversized application component into domain hooks, services, utilities, and page components.
- Use one canonical domain vocabulary across contract, API, UI, tests, and documentation.
- Validate all inputs in both user-facing code and authoritative contract or server logic.
- Include loading, empty, success, and error states.
- Meet responsive layout and keyboard-accessibility basics; provide labels, focus states, semantic controls, and adequate contrast.
- Avoid fabricated dashboard figures. Metrics must be derived from stored or chain data and label simulation sources.
- Add contract tests, API tests, and critical UI workflow tests.
- Ensure fresh-install commands, build, tests, and local setup complete successfully.
- Update ABI and deployed-address generation when contracts change.
- Keep secrets in ignored environment files and provide safe examples.
- Update README and operational guides to match the final implementation.

## Definition of done

The project is complete only when:

- Branding and domain terminology consistently say AgroChain and support cassava and maize.
- Required stakeholder roles and permissions work.
- End-to-end batch traceability works across required value-chain activities.
- Input verification, storage, processing, quality, logistics, marketplace, payment, insurance, QR verification, analytics, and cybersecurity workflows are present at the level described above.
- Simulated functionality is visibly identified as simulated.
- Smart-contract and application authorization rules are tested.
- No requested feature is merely a static card or non-functional button.
- No out-of-scope feature has been added.
- Build and automated tests pass.
- The responsive UI has been checked on desktop and mobile widths.
- Documentation accurately describes setup, architecture, roles, workflows, limitations, and demo steps.

---

# Prompts for Antigravity

Run these prompts in order. Commit or checkpoint after each successful phase. Do not start the next phase until the current phase builds and its relevant tests pass.

## Prompt 1: Repository audit and implementation plan

```text
You are editing the existing repository in place. Read docs/AGROCHAIN_ANTIGRAVITY_IMPLEMENTATION_BRIEF.md completely and treat it as the strict product scope. Inspect the smart contract, deployment scripts, dataset pipeline, API, React UI, tests, and documentation.

Do not change code yet. Produce a concise implementation plan that:
1. Maps every required feature in the brief to existing reusable code, necessary changes, and planned tests.
2. Identifies CassavaTrace assumptions that must become cassava-and-maize AgroChain concepts.
3. Identifies data migrations or ABI-breaking smart-contract changes.
4. Separates real functionality from local simulations and describes how simulation will be labelled.
5. Lists ambiguities or blockers without inventing new scope.
6. Proposes phased file-level changes that keep the project buildable after every phase.

Do not propose any feature listed under exclusions. Do not claim integrations or infrastructure that are not present.
```

## Prompt 2: Core domain model, smart contracts, and tests

```text
Implement the AgroChain core domain and smart-contract layer according to docs/AGROCHAIN_ANTIGRAVITY_IMPLEMENTATION_BRIEF.md.

Evolve the existing contract rather than discarding working behavior without reason. Support cassava and maize, all required stakeholder roles, digital identity status, input verification, batch provenance, farm/harvest records, storage readings, processing and quality records, logistics/custody events, marketplace procurement, payment status, and insurance/claim status. Use coherent identifiers and emit events needed to reconstruct histories.

Enforce role authorization, ownership/custody rules, valid forward state transitions, nonzero addresses, required fields, positive quantities/amounts, and existence/uniqueness checks. Keep sensitive or high-volume raw data off-chain where appropriate, but store tamper-evident references and essential state on-chain. Clearly document that local Ganache is the demonstration network for the permissioned workflow.

Add comprehensive automated contract tests for successful flows, unauthorized calls, invalid transitions, duplicates, nonexistent records, and final states. Update deployment scripts, ABI synchronization, and contract-address handling. Run compilation and tests and fix all failures before stopping.

Do not add tokens, NFTs, cryptocurrency trading, unrelated finance, or unrequested roles.
```

## Prompt 3: Local API, persistence, IoT simulation, analytics, and security telemetry

```text
Implement the minimum local server and data layer required by the AgroChain brief. Preserve useful existing dataset behavior and expand it from cassava-only to cassava-and-maize data.

Provide validated endpoints or services for off-chain stakeholder profiles, detailed farm and quality metadata, IoT/storage readings, analytics, risk insights, and cybersecurity events/incidents. Add a clearly labelled IoT simulator or ingestion workflow for temperature and humidity when hardware is unavailable. Derive analytics and risk scores deterministically from stored data unless a real trained model is included and evaluated. Label prototype analytics accurately.

Cybersecurity telemetry must cover only observable application events: wallet/authentication activity, authorization failures, invalid state attempts, repeated suspicious actions, and ingestion anomalies. Support incident acknowledgement, investigation, and resolution with an audit history.

Use safe local persistence suitable for this repository, schema validation, consistent error responses, pagination or limits where needed, and no committed secrets. Add automated API tests and fixtures for cassava and maize. Ensure the server can start cleanly and all tests pass.

Do not invent third-party connections to banks, insurers, regulators, IoT vendors, AI vendors, or Niji Agro.
```

## Prompt 4: AgroChain application shell, identity, and role-aware navigation

```text
Transform the React UI branding and application shell from CassavaTrace to AgroChain while following docs/AGROCHAIN_ANTIGRAVITY_IMPLEMENTATION_BRIEF.md.

Refactor oversized components into maintainable domain hooks, services, utilities, layouts, and pages. Implement responsive, accessible, role-aware navigation for Dashboard, Traceability, Inputs, Storage and Processing, Logistics, Marketplace, Analytics, Security, Administration, and Verify Product. Hide or disable unauthorized actions based on the connected wallet identity, while still enforcing authorization in authoritative layers.

Implement stakeholder registration/approval and role assignment in Administration. Display connected identity, role, network, and authorization status clearly. Add proper loading, empty, success, validation, wallet/network, and error states. Retain the existing green agricultural visual direction but ensure consistent AgroChain naming and cassava-and-maize language.

Do not create decorative pages with fake figures or non-functional controls. Add or update critical component/workflow tests, then run the build and tests.
```

## Prompt 5: End-to-end traceability, inputs, storage, processing, quality, and logistics

```text
Implement functional AgroChain operational workflows according to docs/AGROCHAIN_ANTIGRAVITY_IMPLEMENTATION_BRIEF.md.

Create cassava and maize batches and show complete provenance. Implement agro-input registration, verification, and linkage to farm/batch records. Implement farm activity and harvest records; storage readings and threshold alerts; processing events and outputs; quality assessments and certifications; shipment creation; custody transfer; dispatch, receipt, and delivery confirmation.

The Traceability page must reconstruct a chronological journey using contract events and associated off-chain detail. Every action must validate inputs, enforce connected-role permissions, submit to the proper contract/API layer, show transaction progress, refresh state after success, and display useful errors. Preserve forward-only lifecycle rules and an auditable history.

Use real stored or chain-derived data in dashboards and tables. Clearly label simulated IoT data. Add tests for the main cassava flow, maize flow, permission failures, invalid transitions, and empty/error states. Run all relevant tests and the production build.
```

## Prompt 6: Marketplace, procurement, payments, and insurance

```text
Implement only the marketplace and transaction capabilities explicitly required by docs/AGROCHAIN_ANTIGRAVITY_IMPLEMENTATION_BRIEF.md.

Authorized sellers can create cassava or maize listings with quantity, unit, price, location, quality information, linked batch, and availability. Eligible buyers can create procurement orders or accept listings. Track order state and preserve the relationship among listing, order, batch, seller, buyer, and settlement.

Implement payment intent/status and insurance policy/claim records with role and state validation. Because this repository has no approved external banking or insurance provider, use clearly labelled local simulated settlement and coverage workflows. Do not imply that real money moved or a real insurer issued coverage.

All screens and controls must be functional, data-backed, responsive, and accessible. Add contract/API/UI tests covering normal flows, unauthorized actions, insufficient or invalid state, cancellation/final states where supported, and simulation labels. Run all tests and the build.

Do not add lending, tokens, NFTs, auctions, cryptocurrency exchange, shopping-cart features, or unrelated commerce.
```

## Prompt 7: QR verification, analytics, AI-labelled insights, and cybersecurity operations

```text
Complete the verification, analytics, and cybersecurity capabilities in docs/AGROCHAIN_ANTIGRAVITY_IMPLEMENTATION_BRIEF.md.

Generate a QR code or QR-ready URL for a batch or finished product. Build a public consumer verification view showing crop, origin, journey, quality/certification details, and a clear verification outcome without exposing sensitive data.

Build analytics from actual stored and blockchain data for volumes, status, traceability coverage, integrity coverage, storage exceptions, post-harvest-loss indicators, quality results, marketplace activity, efficiency, and operational risk. If risk insights are deterministic rules rather than a trained model, label them as prototype analytics or AI-ready risk insights and document the calculation.

Build a role-protected cybersecurity dashboard showing observable security events and incidents with severity, source/actor, timestamp, evidence summary, status, and acknowledge/investigate/resolve actions. Never claim broader threat visibility than the collected telemetry provides.

Add automated tests for public verification privacy, valid/invalid IDs, metric calculations, risk labels, incident authorization, and incident state history. Run the test suite and production build.
```

## Prompt 8: Final quality, documentation, and handoff

```text
Perform a complete release-quality pass on the AgroChain repository using docs/AGROCHAIN_ANTIGRAVITY_IMPLEMENTATION_BRIEF.md as the acceptance checklist.

First audit every required feature and every exclusion. Finish missing behavior, but do not add new scope. Remove stale CassavaTrace-only wording and dead code. Verify terminology, crop support, role permissions, simulation labels, privacy, input validation, transaction feedback, empty states, error states, mobile layouts, keyboard access, and color contrast.

Run formatting/linting if configured, smart-contract tests, API tests, UI tests, end-to-end critical workflows, and the production build. Fix root causes of every failure; do not disable tests or weaken assertions. Test at least one complete cassava journey and one complete maize journey, plus admin identity management, input verification, storage/IoT simulation, quality certification, logistics, marketplace procurement, simulated payment, insurance record, QR verification, analytics, and cybersecurity incident handling.

Update README and guides with architecture, prerequisites, safe environment setup, deployment, roles, workflows, test commands, demo steps, known limitations, and an explicit list of simulated capabilities. Ensure a fresh checkout can be set up using documented commands. Provide a final report containing changed areas, test/build results, remaining limitations, and a requirement-by-requirement compliance matrix.

Do not claim completion for a static placeholder, fake metric, unavailable external integration, or untested flow.
```

## Final instruction to keep attached to every Antigravity prompt

```text
Scope guard: docs/AGROCHAIN_ANTIGRAVITY_IMPLEMENTATION_BRIEF.md is authoritative. Do not implement features outside it. If a decision would materially expand scope, stop and ask for approval. Preserve user work, make focused changes, and keep the project buildable and tested.
```
