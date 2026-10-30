import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ethers } from "ethers";

const rpcUrl = "http://127.0.0.1:7545";
const chainId = 1337;

// Put your UI folder name here (change if yours is different)
const UI_OUT_DIR = "ui/src";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const parseEnvContent = (raw) => {
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
};

const loadLocalEnv = async () => {
  const candidates = [
    path.join(__dirname, "..", ".env.local"),
    path.join(__dirname, "..", ".env"),
  ];
  const merged = {};
  for (const file of candidates) {
    try {
      const raw = await readFile(file, "utf8");
      Object.assign(merged, parseEnvContent(raw));
    } catch {
      // Ignore missing env files.
    }
  }
  return merged;
};

const localEnv = await loadLocalEnv();

const privateKey = process.env.GANACHE_PRIVATE_KEY || localEnv.GANACHE_PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Set GANACHE_PRIVATE_KEY in your environment or .env.local (Ganache account private key).");
}
const artifactCandidates = [
  path.join(__dirname, "..", "artifacts", "contracts", "AgroChain.sol", "AgroChain.json"),
  path.join(__dirname, "..", "artifacts", "contracts", "CassavaSupplyChain.sol", "CassavaSupplyChain.json"),
];

let artifact = null;
let contractName = "AgroChain";

for (const candidate of artifactCandidates) {
  try {
    const raw = await readFile(candidate, "utf8");
    artifact = JSON.parse(raw);
    contractName = path.basename(candidate, ".json");
    break;
  } catch {
    // Continue searching
  }
}

if (!artifact) {
  throw new Error("Compiled contract artifact not found. Please run: npx hardhat compile");
}

const provider = new ethers.JsonRpcProvider(rpcUrl, { chainId, name: "ganache" });
const wallet = new ethers.Wallet(privateKey, provider);

console.log(`Deploying ${contractName} with wallet:`, await wallet.getAddress());

const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
const contract = await factory.deploy();
await contract.waitForDeployment();

const address = await contract.getAddress();
console.log(`${contractName} deployed to:`, address);


const roleDefinitions = [
  ["FARMER", 2n],
  ["INPUT_SUPPLIER", 3n],
  ["EXTENSION_OFFICER", 4n],
  ["STORAGE_OPERATOR", 5n],
  ["PROCESSOR", 6n],
  ["TRANSPORTER", 7n],
  ["DISTRIBUTOR", 8n],
  ["FINANCIAL_INSTITUTION", 9n],
  ["REGULATOR", 10n],
];

const exposedAccounts = await provider.send("eth_accounts", []);
const adminAddress = (await wallet.getAddress()).toLowerCase();
const availableStakeholders = exposedAccounts.filter((account) => account.toLowerCase() !== adminAddress);
if (availableStakeholders.length < roleDefinitions.length) {
  throw new Error(`Ganache needs at least ${roleDefinitions.length + 1} accounts to provision one wallet per operational role.`);
}

const roleAddresses = { ADMINISTRATOR: await wallet.getAddress() };
for (let index = 0; index < roleDefinitions.length; index += 1) {
  const [roleName, roleId] = roleDefinitions[index];
  const stakeholderAddress = availableStakeholders[index];
  const transaction = await contract.registerStakeholder(
    stakeholderAddress,
    `AgroChain ${roleName.replaceAll("_", " ")} Demonstrator`,
    roleId,
    1n,
  );
  await transaction.wait();
  roleAddresses[roleName] = stakeholderAddress;
  console.log(`Assigned ${roleName.padEnd(22)} to ${stakeholderAddress}`);
}
roleAddresses.CONSUMER = "PUBLIC_NO_WALLET_REQUIRED";

// ✅ Write address + ABI into UI folder
const outDir = path.join(__dirname, "..", UI_OUT_DIR);
await mkdir(outDir, { recursive: true });

await writeFile(
  path.join(outDir, "contract-address.json"),
  JSON.stringify({ AgroChain: address, CassavaSupplyChain: address, chainId }, null, 2),
  "utf8"
);

await writeFile(
  path.join(outDir, "abi.json"),
  JSON.stringify(artifact.abi, null, 2),
  "utf8"
);

console.log(`Wrote UI files:
- ${UI_OUT_DIR}/contract-address.json
- ${UI_OUT_DIR}/abi.json`);

const processedDir = path.join(__dirname, "..", "data", "processed");
await mkdir(processedDir, { recursive: true });
await writeFile(
  path.join(processedDir, "ganache-role-addresses.json"),
  JSON.stringify({
    network: { name: "Ganache Local", rpcUrl, chainId },
    contractAddress: address,
    roles: roleAddresses,
  }, null, 2),
  "utf8",
);
console.log("- data/processed/ganache-role-addresses.json");
