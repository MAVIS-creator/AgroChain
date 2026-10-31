# AgroChain verification record — 31 October 2026

## Repository changes in PR #2
- Added automated GitHub Actions jobs for Solidity and API tests, React build and browser smoke tests, plus a disposable local Ganache integration test.
- Replaced Windows-only `npx.cmd` in Playwright config with cross-platform `npm run dev -- --host 127.0.0.1`.
- Repaired the missing `yaml@2.9.1` nested dependency record in `ui/package-lock.json`, enabling `npm ci` without an ad hoc install.

## Executed checks
- [Successful initial CI validation run #41228656564](https://github.com/MAVIS-creator/AgroChain/actions/runs/41228656564): six named contract scenarios, 23 API/telemetry checks, production UI build and two Playwright smoke tests passed.
- [Disposable Ganache integration run #41229129706](https://github.com/MAVIS-creator/AgroChain/actions/runs/41229129706): contract deployed on ephemeral chain ID 1337; batch #1001 reached PROCESSED, #1002 reached IN_TRANSIT and #1003 reached DELIVERED. This job uses CI-only addresses and does **not** import the researcher's ten Ganache wallets.
- The canonical final-branch verification should be the latest successful GitHub Actions run on this PR after lockfile repair.

## Important limitations
1. These checks do not demonstrate production EVM deployability, a public consortium network or performance under load. Local Ganache enables unlimited contract size for this prototype.
2. API storage readings are simulated; dashboard loss and transport estimates are modeled values, not field measurements.
3. Payments and insurance are demonstrator records, not real bank transfer or insurer settlement.
4. The risk engine is deterministic and has not been validated as a trained machine-learning model.
5. A public QR lookup does not itself perform the role-restricted on-chain CONSUMER_VERIFIED transition.

## Remaining evidence needed for final academic report
Capture 20 genuine local screenshots S01–S20 as described in the separate screenshot manual. Use the saved role mapping in `data/processed/ganache-role-addresses.json`; do not assume the stored historical contract address remains valid after chain reset. Record test commands, outputs, source SHA, current contract address, stage progression and transaction hashes. Never capture private keys or wallet recovery phrases.

The GitHub Actions jobs validate code on disposable ephemeral test infrastructure. The final dissertation should keep automated results distinct from the researcher's manual local demo and from field or laboratory observations.
