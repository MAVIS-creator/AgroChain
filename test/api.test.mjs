import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Wallet } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const TEST_PORT = 3131;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;
const testAdmin = Wallet.createRandom();
const dataDir = await mkdtemp(path.join(os.tmpdir(), "agrochain-api-test-"));

function signatureMessage(method, pathname, timestamp, payload = {}) {
  return ["AgroChain local admin request", method, pathname, String(timestamp), JSON.stringify(payload)].join("|");
}

async function adminHeaders(method, pathname, payload = {}) {
  const timestamp = Date.now();
  const signature = await testAdmin.signMessage(signatureMessage(method, pathname, timestamp, payload));
  return {
    "X-AgroChain-Actor": testAdmin.address,
    "X-AgroChain-Timestamp": String(timestamp),
    "X-AgroChain-Signature": signature,
  };
}

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
    env: {
      ...process.env,
      DATASET_API_PORT: String(TEST_PORT),
      DATASET_API_HOST: "127.0.0.1",
      DATASET_STORAGE_DIR: dataDir,
      SECURITY_ADMIN_ADDRESSES: testAdmin.address,
    },
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
    const deniedOrigin = await fetch(`${BASE_URL}/health`, { headers: { Origin: "https://example.invalid" } });
    assert(deniedOrigin.status === 403, "Untrusted browser origins are rejected");
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
    const invalidReading = await fetch(`${BASE_URL}/api/iot/reading`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId: "20269999", facility: "Test", temperature: 24, humidity: 140 }),
    });
    assert(invalidReading.status === 400, "Out-of-range sensor readings are rejected");

    // 5. Deterministic AI-Ready Risk Engine
    console.log("\n5. Testing /api/analytics/risk-insights");
    const riskRes = await fetch(`${BASE_URL}/api/analytics/risk-insights?batchId=20261001&crop=Cassava&transportHours=14`);
    const riskData = await riskRes.json();
    assert(typeof riskData.riskScore === "number", "Risk score computed numerically");
    assert(["LOW", "MEDIUM", "HIGH"].includes(riskData.category), "Risk category is valid");
    assert(riskData.labeledAs.includes("Deterministic Evaluation Prototype"), "Risk insights labeled as prototype");

    // 6. Cybersecurity Telemetry & Incident Operations
    console.log("\n6. Testing /api/security/events and /api/security/incidents");
    const deniedEventsRes = await fetch(`${BASE_URL}/api/security/events`);
    assert(deniedEventsRes.status === 401, "Security telemetry is hidden without administrator signature");

    const eventPayload = {
      eventType: "UNAUTHORIZED_STAGE_TRANSITION",
      severity: "HIGH",
      summary: "Test-only simulated unauthorized transition report",
    };
    const eventAuth = await adminHeaders("POST", "/api/security/events", eventPayload);
    const eventRes = await fetch(`${BASE_URL}/api/security/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...eventAuth },
      body: JSON.stringify({ actor: testAdmin.address, timestamp: Number(eventAuth["X-AgroChain-Timestamp"]), signature: eventAuth["X-AgroChain-Signature"], payload: eventPayload }),
    });
    const eventData = await eventRes.json();
    assert(eventData.success === true, "Security telemetry event logged");

    const incidentsAuth = await adminHeaders("GET", "/api/security/incidents");
    const incRes = await fetch(`${BASE_URL}/api/security/incidents`, { headers: incidentsAuth });
    const incData = await incRes.json();
    assert(incData.count === 1, "High severity event automatically escalated to an incident");

    const incidentId = incData.incidents[0].id;
    const actionPath = `/api/security/incidents/${incidentId}/action`;
    const actionPayload = { action: "investigate", note: "Test-only investigation note" };
    const actionTimestamp = Date.now();
    const actionSignature = await testAdmin.signMessage(signatureMessage("POST", actionPath, actionTimestamp, actionPayload));
    const actionRes = await fetch(`${BASE_URL}${actionPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...actionPayload,
        payload: actionPayload,
        actor: testAdmin.address,
        timestamp: actionTimestamp,
        signature: actionSignature,
      }),
    });
    const actionData = await actionRes.json();
    assert(actionData.success === true, "Incident action updated successfully");
    assert(actionData.incident.status === "INVESTIGATING", "Incident transitioned to INVESTIGATING");

    const resolvePayload = { action: "resolve", note: "Test-only resolution after investigation" };
    const resolveTimestamp = Date.now();
    const resolveSignature = await testAdmin.signMessage(signatureMessage("POST", actionPath, resolveTimestamp, resolvePayload));
    const resolveRes = await fetch(`${BASE_URL}${actionPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...resolvePayload, payload: resolvePayload, actor: testAdmin.address, timestamp: resolveTimestamp, signature: resolveSignature }),
    });
    const resolveData = await resolveRes.json();
    assert(resolveData.incident.status === "RESOLVED", "Investigated incident can be resolved with a signed action");

    const invalidRepeatAuth = await adminHeaders("POST", actionPath, { action: "resolve", note: "Resolve from investigating" });
    const invalidRepeat = await fetch(`${BASE_URL}${actionPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve", note: "Changed after signing", payload: { action: "resolve", note: "Resolve from investigating" }, actor: testAdmin.address, timestamp: Number(invalidRepeatAuth["X-AgroChain-Timestamp"]), signature: invalidRepeatAuth["X-AgroChain-Signature"] }),
    });
    assert(invalidRepeat.status === 401, "Incident action cannot differ from the signed payload");

    const persisted = JSON.parse(await readFile(path.join(dataDir, "security-telemetry.json"), "utf8"));
    assert(persisted.events.length === 1 && persisted.incidents[0].history.length === 3, "Security event and full action history persist to local storage");

    console.log("\n========================================================");
    console.log("All AgroChain Local API & Telemetry tests PASSED!");
    console.log("========================================================\n");
  } finally {
    apiProcess.kill();
    await rm(dataDir, { recursive: true, force: true });
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
