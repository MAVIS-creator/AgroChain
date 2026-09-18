import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const TEST_PORT = 3131;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    throw new Error(message);
  }
  console.log(`  [PASS] ${message}`);
}

async function runTests() {
  console.log("\n========================================================");
  console.log("Starting AgroChain Local Server & Telemetry API Tests");
  console.log("========================================================\n");

  // Spawn API server process on TEST_PORT
  const apiProcess = spawn("node", ["server/dataset-api.mjs"], {
    cwd: repoRoot,
    env: { ...process.env, DATASET_API_PORT: String(TEST_PORT), DATASET_API_HOST: "127.0.0.1" },
    stdio: "pipe",
  });

  apiProcess.stderr.on("data", (data) => console.error(`[server err]: ${data}`));

  // Wait for server to start
  let started = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) {
        started = true;
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  if (!started) {
    apiProcess.kill();
    throw new Error("Server failed to spin up on test port.");
  }

  try {
    // 1. Health Check
    console.log("1. Testing /health endpoint");
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    assert(health.status === "ok", "Server reports healthy status");
    assert(health.service === "agrochain-data-api", "Service identifies as agrochain-data-api");

    // 2. Dataset Summary
    console.log("\n2. Testing /api/dataset/summary");
    const summaryRes = await fetch(`${BASE_URL}/api/dataset/summary`);
    const summaryData = await summaryRes.json();
    assert(summaryData.ecosystem === "AgroChain", "Ecosystem branded as AgroChain");
    assert(summaryData.summary !== undefined, "Summary metrics returned");

    // 3. Dual-Crop Filtering
    console.log("\n3. Testing /api/dataset/records with crop filter");
    const cassavaRes = await fetch(`${BASE_URL}/api/dataset/records?crop=cassava&limit=5`);
    const cassavaData = await cassavaRes.json();
    assert(Array.isArray(cassavaData.records), "Cassava records returned as array");

    const maizeRes = await fetch(`${BASE_URL}/api/dataset/records?crop=maize&limit=5`);
    const maizeData = await maizeRes.json();
    assert(Array.isArray(maizeData.records), "Maize records returned as array");

    // 4. Storage & IoT Telemetry
    console.log("\n4. Testing /api/iot/readings and /api/iot/simulate");
    const iotReadingsRes = await fetch(`${BASE_URL}/api/iot/readings`);
    const iotReadings = await iotReadingsRes.json();
    assert(iotReadings.labeledAs === "Simulated IoT Telemetry", "Telemetry accurately labeled as simulated");
    assert(iotReadings.count >= 2, "Seed IoT readings present");

    const simRes = await fetch(`${BASE_URL}/api/iot/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId: "20269999", cropType: "Maize" }),
    });
    const simData = await simRes.json();
    assert(simData.success === true, "Simulated reading successfully ingested");
    assert(simData.reading.isSimulated === true, "Simulated reading flagged as isSimulated: true");

    // 5. Deterministic AI-Ready Risk Engine
    console.log("\n5. Testing /api/analytics/risk-insights");
    const riskRes = await fetch(`${BASE_URL}/api/analytics/risk-insights?batchId=20261001&crop=Cassava&transportHours=14`);
    const riskData = await riskRes.json();
    assert(typeof riskData.riskScore === "number", "Risk score computed numerically");
    assert(["LOW", "MEDIUM", "HIGH"].includes(riskData.category), "Risk category is valid");
    assert(riskData.labeledAs.includes("Deterministic Evaluation Prototype"), "Risk insights labeled as prototype");

    // 6. Cybersecurity Telemetry & Incident Operations
    console.log("\n6. Testing /api/security/events and /api/security/incidents");
    const eventRes = await fetch(`${BASE_URL}/api/security/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "UNAUTHORIZED_STAGE_TRANSITION",
        severity: "HIGH",
        actor: "0xTestUserWallet",
        summary: "Attempted forward transition without custodian authorization",
      }),
    });
    const eventData = await eventRes.json();
    assert(eventData.success === true, "Security telemetry event logged");

    const incRes = await fetch(`${BASE_URL}/api/security/incidents`);
    const incData = await incRes.json();
    assert(incData.count >= 2, "High severity event automatically escalated to incident");

    const incidentToResolve = incData.incidents[0].id;
    const actionRes = await fetch(`${BASE_URL}/api/security/incidents/${incidentToResolve}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "investigate",
        actor: "Admin01",
        note: "Verified isolated testing event, investigating root cause",
      }),
    });
    const actionData = await actionRes.json();
    assert(actionData.success === true, "Incident action updated successfully");
    assert(actionData.incident.status === "INVESTIGATING", "Incident transitioned to INVESTIGATING");

    console.log("\n========================================================");
    console.log("All AgroChain Local API & Telemetry tests PASSED!");
    console.log("========================================================\n");
  } finally {
    apiProcess.kill();
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
