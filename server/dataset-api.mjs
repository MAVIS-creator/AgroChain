import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const agrochainDatasetPath = path.join(repoRoot, "data", "processed", "agrochain-dataset.json");
const cassavaDatasetPath = path.join(repoRoot, "data", "processed", "cassava-dataset.json");
const storageTelemetryPath = path.join(repoRoot, "data", "processed", "iot-telemetry.json");
const securityLogsPath = path.join(repoRoot, "data", "processed", "security-telemetry.json");

const host = process.env.DATASET_API_HOST || "127.0.0.1";
let port = Number(process.env.DATASET_API_PORT || 3030);
const uiEnvPath = path.join(repoRoot, "ui", ".env");

// ----------------------------------------------------------------------------
// In-Memory Telemetry & Persistence Cache
// ----------------------------------------------------------------------------
let cachedDataset = null;
let iotReadings = [];
let securityEvents = [];
let securityIncidents = [];
let incidentCounter = 100;

// Rate limiting table (IP -> [timestamps])
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 120;
const RATE_LIMIT_WINDOW_MS = 60000;

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (rateLimitMap.get(ip) || []).filter((t) => t > windowStart);
  if (timestamps.length >= RATE_LIMIT_MAX) {
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

// ----------------------------------------------------------------------------
// Port Detection & Auto-Sync
// ----------------------------------------------------------------------------
async function isDatasetApiRunning(targetHost, targetPort) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);

  try {
    const response = await fetch(`http://${targetHost}:${targetPort}/health`, {
      signal: controller.signal,
    });
    if (!response.ok) return false;
    const payload = await response.json();
    return payload?.service === "agrochain-data-api" || payload?.service === "cassava-dataset-api";
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function findAvailablePort(startPort, maxAttempts = 5) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidatePort = startPort + attempt;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800);

    try {
      const response = await fetch(`http://${host}:${candidatePort}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const payload = await response.json();
        if (payload?.service === "agrochain-data-api" || payload?.service === "cassava-dataset-api") {
          return { port: candidatePort, status: "already-running" };
        }
      }
    } catch {
      clearTimeout(timeoutId);
    }

    const { createConnection } = await import("node:net");
    try {
      return await new Promise((resolve, reject) => {
        const socket = createConnection(candidatePort, host);
        socket.on("connect", () => {
          socket.destroy();
          reject(new Error("port-in-use"));
        });
        socket.on("error", () => {
          resolve({ port: candidatePort, status: "available" });
        });
        setTimeout(() => {
          socket.destroy();
          reject(new Error("timeout"));
        }, 300);
      });
    } catch (error) {
      if (error?.message === "port-in-use") continue;
      continue;
    }
  }
  return null;
}

async function updateUiEnvApiUrl(newPort) {
  try {
    let envContent = await readFile(uiEnvPath, "utf8");
    const newUrl = `http://127.0.0.1:${newPort}`;
    envContent = envContent.replace(
      /VITE_DATASET_API_URL=.+/,
      `VITE_DATASET_API_URL=${newUrl}`,
    );
    await writeFile(uiEnvPath, envContent, "utf8");
  } catch {
    // ui/.env might not exist yet
  }
}

// ----------------------------------------------------------------------------
// Dataset & Persistence Loaders
// ----------------------------------------------------------------------------
async function loadDataset() {
  if (cachedDataset) return cachedDataset;

  let fileText = null;
  try {
    fileText = await readFile(agrochainDatasetPath, "utf8");
  } catch {
    try {
      fileText = await readFile(cassavaDatasetPath, "utf8");
    } catch {
      // Fallback default structure if pipeline has not been executed yet
      return {
        generatedAt: new Date().toISOString(),
        source: { url: "local-fallback", id: "default-local" },
        summary: {
          totalRecords: 0,
          totalQuantityKg: 0,
          avgLossPct: 9.2,
          avgTransportHours: 12,
          byRegion: [],
          byCrop: { cassava: 0, maize: 0 },
        },
        records: [],
      };
    }
  }

  cachedDataset = JSON.parse(fileText);
  return cachedDataset;
}

// Initialize seed security telemetry and IoT readings
function initTelemetry() {
  if (iotReadings.length === 0) {
    iotReadings = [
      {
        id: "IOT-INIT-001",
        batchId: "20261001",
        cropType: "Cassava",
        facility: "Oyo Central Storage Hub",
        temperature: 23.5,
        humidity: 62.0,
        sensorId: "DHT22-OYO-01",
        isSimulated: true,
        temperatureExceeded: false,
        humidityExceeded: false,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "IOT-INIT-002",
        batchId: "20262001",
        cropType: "Maize",
        facility: "Kaduna Grain Silo A",
        temperature: 29.8,
        humidity: 74.5,
        sensorId: "DHT22-KAD-02",
        isSimulated: true,
        temperatureExceeded: true,
        humidityExceeded: true,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
    ];
  }

  if (securityEvents.length === 0) {
    securityEvents = [
      {
        id: "SEC-LOG-001",
        eventType: "AUTHENTICATION",
        severity: "INFO",
        actor: "0x1a89...4b92",
        summary: "Authorized administrator session initialized.",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "SEC-LOG-002",
        eventType: "UNAUTHORIZED_ATTEMPT",
        severity: "HIGH",
        actor: "0x98f2...11c4",
        summary: "Non-owner attempted unauthorized status transition on batch #20261001.",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    securityIncidents = [
      {
        id: "INC-101",
        title: "Unauthorized Stage Transition Attempt",
        severity: "HIGH",
        status: "OPEN", // OPEN, INVESTIGATING, RESOLVED
        reportedBy: "Authorization Guard",
        actor: "0x98f2...11c4",
        evidence: "Transaction call revert: AgroChain: Only current batch custodian permitted",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        history: [
          { status: "OPEN", note: "Automated anomaly flagged by state-machine filter.", timestamp: new Date(Date.now() - 3600000).toISOString() },
        ],
      },
    ];
  }
}

// ----------------------------------------------------------------------------
// Response Helpers
// ----------------------------------------------------------------------------
function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  });
  response.end(JSON.stringify(payload));
}

function sendNoContent(response) {
  response.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  });
  response.end();
}

async function parseJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let byteCount = 0;
    const MAX_BYTES = 65536; // 64 KB safety limit against memory attacks

    request.on("data", (chunk) => {
      byteCount += chunk.length;
      if (byteCount > MAX_BYTES) {
        reject(new Error("Request payload exceeds 64KB limit."));
        request.destroy();
        return;
      }
      raw += chunk;
    });

    request.on("end", () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error("Malformed JSON in request body."));
      }
    });

    request.on("error", (err) => reject(err));
  });
}

// ----------------------------------------------------------------------------
// Deterministic Risk Scoring Engine
// ----------------------------------------------------------------------------
function calculateBatchRisk(batchId, cropType = "Cassava", storageHistory = [], transitHours = 12) {
  let riskScore = 15; // Baseline low operational risk
  const riskFactors = [];

  // Storage temperature and humidity checks
  const recentStorage = storageHistory.filter((s) => String(s.batchId) === String(batchId));
  const tempBreaches = recentStorage.filter((s) => s.temperature > 28);
  const humidityBreaches = recentStorage.filter((s) => s.humidity > 70);

  if (tempBreaches.length > 0) {
    const penalty = Math.min(35, tempBreaches.length * 15);
    riskScore += penalty;
    riskFactors.push(`Storage temperature exceeded safe threshold (28°C) ${tempBreaches.length} times.`);
  }

  if (humidityBreaches.length > 0) {
    const penalty = Math.min(30, humidityBreaches.length * 12);
    riskScore += penalty;
    riskFactors.push(`Storage relative humidity exceeded safe threshold (70%) ${humidityBreaches.length} times.`);
  }

  // Transit delay risk
  if (transitHours > 16) {
    riskScore += 25;
    riskFactors.push(`High transport latency (${transitHours} hrs) poses physiological deterioration risk.`);
  } else if (transitHours > 12) {
    riskScore += 10;
    riskFactors.push(`Moderate transport latency (${transitHours} hrs).`);
  }

  // Crop-specific vulnerability
  if (cropType.toLowerCase() === "cassava" && recentStorage.length > 2) {
    riskScore += 10;
    riskFactors.push("Cassava roots susceptible to Post-Harvest Physiological Deterioration (PPD) within 48-72 hrs.");
  } else if (cropType.toLowerCase() === "maize" && humidityBreaches.length > 0) {
    riskScore += 15;
    riskFactors.push("Elevated moisture in maize increases mycotoxin/aflatoxin contamination risk.");
  }

  const boundedScore = Math.max(5, Math.min(95, riskScore));
  const category = boundedScore >= 70 ? "HIGH" : boundedScore >= 40 ? "MEDIUM" : "LOW";

  return {
    batchId: String(batchId),
    cropType,
    riskScore: boundedScore,
    category,
    contributingFactors: riskFactors.length > 0 ? riskFactors : ["Storage and transportation within optimal safety thresholds."],
    evaluationMethod: "Deterministic environmental, latency, and crop vulnerability heuristic",
    labeledAs: "AI-Ready Risk Insights (Deterministic Evaluation Prototype)",
    evaluatedAt: new Date().toISOString(),
  };
}

// ----------------------------------------------------------------------------
// HTTP Server Dispatcher
// ----------------------------------------------------------------------------
initTelemetry();

const server = createServer(async (request, response) => {
  const clientIp = request.socket.remoteAddress || "127.0.0.1";

  if (!checkRateLimit(clientIp)) {
    sendJson(response, 429, { error: "Rate limit exceeded. Try again in one minute." });
    return;
  }

  if (!request.url) {
    sendJson(response, 400, { error: "Invalid request URL." });
    return;
  }

  if (request.method === "OPTIONS") {
    sendNoContent(response);
    return;
  }

  const url = new URL(request.url, `http://${host}:${port}`);

  // --------------------------------------------------------------------------
  // Health & Service Discovery
  // --------------------------------------------------------------------------
  if (url.pathname === "/health") {
    sendJson(response, 200, {
      status: "ok",
      service: "agrochain-data-api",
      ecosystem: "AgroChain: Smart Cassava & Maize Value Chain",
      time: new Date().toISOString(),
    });
    return;
  }

  try {
    const dataset = await loadDataset();

    // ------------------------------------------------------------------------
    // Dataset Summary
    // ------------------------------------------------------------------------
    if (request.method === "GET" && url.pathname === "/api/dataset/summary") {
      sendJson(response, 200, {
        generatedAt: dataset.generatedAt,
        ecosystem: "AgroChain",
        source: dataset.source,
        summary: dataset.summary,
      });
      return;
    }

    // ------------------------------------------------------------------------
    // Dataset Records (with Crop & Region Filtering)
    // ------------------------------------------------------------------------
    if (request.method === "GET" && url.pathname === "/api/dataset/records") {
      const limit = Math.max(1, Math.min(200, Number(url.searchParams.get("limit") || 20)));
      const regionFilter = (url.searchParams.get("region") || "").trim().toLowerCase();
      const cropFilter = (url.searchParams.get("crop") || "").trim().toLowerCase();

      let records = dataset.records || [];

      if (cropFilter) {
        records = records.filter((r) => String(r.cropType || "").toLowerCase() === cropFilter);
      }
      if (regionFilter) {
        records = records.filter((r) => String(r.region || "").toLowerCase().includes(regionFilter));
      }

      sendJson(response, 200, {
        generatedAt: dataset.generatedAt,
        source: dataset.source,
        count: records.length,
        records: records.slice(0, limit),
      });
      return;
    }

    // ------------------------------------------------------------------------
    // Supply Chain Challenges & Empirical Insights
    // ------------------------------------------------------------------------
    if (request.method === "GET" && url.pathname === "/api/dataset/challenges") {
      const summary = dataset.summary || {};
      const totalQtyTonnes = Math.round((summary.totalQuantityKg || 0) / 1000).toLocaleString();

      sendJson(response, 200, {
        generatedAt: dataset.generatedAt,
        insights: [
          `Post-harvest loss pressure averages ${summary.avgLossPct ?? 9.2}% across tracked cassava and maize batches.`,
          `Transport latency averages ${summary.avgTransportHours ?? 11} hours between production farm clusters and processing hubs.`,
          `Total observed regional volume: ${totalQtyTonnes} tonnes, underscoring the necessity of transparent multi-stakeholder provenance.`,
          "Rapid perishability of harvested cassava roots necessitates processing within 48-72 hours to prevent Post-Harvest Physiological Deterioration.",
          "Maize storage requires continuous moisture monitoring below 13% relative humidity equivalent to prevent aflatoxin contamination.",
        ],
      });
      return;
    }

    // ------------------------------------------------------------------------
    // Storage & IoT Telemetry
    // ------------------------------------------------------------------------
    if (request.method === "GET" && url.pathname === "/api/iot/readings") {
      const batchId = url.searchParams.get("batchId");
      let readings = iotReadings;
      if (batchId) {
        readings = readings.filter((r) => String(r.batchId) === String(batchId));
      }
      sendJson(response, 200, {
        count: readings.length,
        labeledAs: "Simulated IoT Telemetry",
        readings: readings.slice(-50).reverse(),
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/iot/reading") {
      const body = await parseJsonBody(request);
      if (!body.batchId || !body.facility || body.temperature === undefined || body.humidity === undefined) {
        sendJson(response, 400, { error: "Missing required reading fields: batchId, facility, temperature, humidity." });
        return;
      }

      const tempNum = Number(body.temperature);
      const humNum = Number(body.humidity);

      const reading = {
        id: `IOT-${Date.now()}`,
        batchId: String(body.batchId),
        cropType: body.cropType || "Cassava",
        facility: String(body.facility).trim(),
        temperature: tempNum,
        humidity: humNum,
        sensorId: String(body.sensorId || "IOT-DEVICE-GENERIC"),
        isSimulated: Boolean(body.isSimulated ?? true),
        temperatureExceeded: tempNum > 28,
        humidityExceeded: humNum > 70,
        timestamp: new Date().toISOString(),
      };

      iotReadings.push(reading);
      sendJson(response, 201, { success: true, reading });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/iot/simulate") {
      const body = await parseJsonBody(request);
      const batchId = String(body.batchId || "20261001");
      const cropType = String(body.cropType || "Cassava");

      // Generate realistic fluctuating simulated reading
      const simTemp = Number((22 + Math.random() * 9).toFixed(1));
      const simHum = Number((55 + Math.random() * 25).toFixed(1));

      const reading = {
        id: `SIM-IOT-${Date.now()}`,
        batchId,
        cropType,
        facility: "Regional Silo & Storage Facility",
        temperature: simTemp,
        humidity: simHum,
        sensorId: `DHT22-SIM-${batchId.slice(-4)}`,
        isSimulated: true,
        temperatureExceeded: simTemp > 28,
        humidityExceeded: simHum > 70,
        timestamp: new Date().toISOString(),
      };

      iotReadings.push(reading);
      sendJson(response, 201, {
        success: true,
        notice: "This reading is demonstrator simulated telemetry.",
        reading,
      });
      return;
    }

    // ------------------------------------------------------------------------
    // Deterministic Risk Scoring
    // ------------------------------------------------------------------------
    if (request.method === "GET" && url.pathname === "/api/analytics/risk-insights") {
      const batchId = url.searchParams.get("batchId") || "20261001";
      const crop = url.searchParams.get("crop") || "Cassava";
      const latency = Number(url.searchParams.get("transportHours") || 12);

      const riskReport = calculateBatchRisk(batchId, crop, iotReadings, latency);
      sendJson(response, 200, riskReport);
      return;
    }

    // ------------------------------------------------------------------------
    // Cybersecurity Telemetry & Incident Operations
    // ------------------------------------------------------------------------
    if (request.method === "GET" && url.pathname === "/api/security/events") {
      sendJson(response, 200, {
        count: securityEvents.length,
        events: securityEvents.slice(-50).reverse(),
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/security/events") {
      const body = await parseJsonBody(request);
      if (!body.eventType || !body.summary) {
        sendJson(response, 400, { error: "eventType and summary are required." });
        return;
      }

      const event = {
        id: `SEC-LOG-${Date.now()}`,
        eventType: String(body.eventType).trim(),
        severity: String(body.severity || "INFO").toUpperCase(),
        actor: String(body.actor || "ANONYMOUS"),
        summary: String(body.summary).trim(),
        timestamp: new Date().toISOString(),
      };

      securityEvents.push(event);

      // Auto-create incident if severity is HIGH or CRITICAL
      if (event.severity === "HIGH" || event.severity === "CRITICAL") {
        incidentCounter += 1;
        securityIncidents.push({
          id: `INC-${incidentCounter}`,
          title: `Security Anomaly: ${event.eventType}`,
          severity: event.severity,
          status: "OPEN",
          reportedBy: "Application Telemetry Sensor",
          actor: event.actor,
          evidence: event.summary,
          createdAt: new Date().toISOString(),
          history: [
            { status: "OPEN", note: "Incident created automatically from detected telemetry event.", timestamp: new Date().toISOString() },
          ],
        });
      }

      sendJson(response, 201, { success: true, event });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/security/incidents") {
      sendJson(response, 200, {
        count: securityIncidents.length,
        incidents: securityIncidents.slice().reverse(),
      });
      return;
    }

    if (request.method === "POST" && url.pathname.startsWith("/api/security/incidents/")) {
      const incidentId = url.pathname.replace("/api/security/incidents/", "").replace("/action", "");
      const body = await parseJsonBody(request);
      const action = String(body.action || "").toLowerCase(); // acknowledge, investigate, resolve
      const note = String(body.note || "No audit note provided").trim();
      const actor = String(body.actor || "Security Administrator");

      const incident = securityIncidents.find((inc) => inc.id === incidentId);
      if (!incident) {
        sendJson(response, 404, { error: `Incident ${incidentId} not found.` });
        return;
      }

      let newStatus = incident.status;
      if (action === "acknowledge" || action === "investigate") {
        newStatus = "INVESTIGATING";
      } else if (action === "resolve") {
        newStatus = "RESOLVED";
      }

      incident.status = newStatus;
      incident.history.push({
        status: newStatus,
        action,
        actor,
        note,
        timestamp: new Date().toISOString(),
      });

      sendJson(response, 200, { success: true, incident });
      return;
    }

    // Route not found
    sendJson(response, 404, { error: "Route not found in AgroChain API." });
  } catch (error) {
    sendJson(response, 500, {
      error: "Internal AgroChain server error.",
      message: error instanceof Error ? error.message : "Unexpected failure",
    });
  }
});

server.on("error", async (error) => {
  if (error?.code !== "EADDRINUSE") {
    console.error("[agrochain-api] failed to start:", error);
    process.exit(1);
    return;
  }

  const alreadyRunning = await isDatasetApiRunning(host, port);
  if (alreadyRunning) {
    console.log(`[agrochain-api] already running on http://${host}:${port}`);
    console.log("[agrochain-api] startup check: successful");
    process.exit(0);
    return;
  }

  console.log(`[agrochain-api] port ${port} is in use, searching for available port...`);
  const result = await findAvailablePort(port, 5);

  if (!result) {
    console.error(`[agrochain-api] no available ports found (tried ${port}–${port + 4}).`);
    process.exit(1);
    return;
  }

  if (result.status === "already-running") {
    console.log(`[agrochain-api] service already running on http://${host}:${result.port}`);
    process.exit(0);
    return;
  }

  port = result.port;
  await updateUiEnvApiUrl(port);
  console.log(`[agrochain-api] using fallback port ${port}. Updated ui/.env VITE_DATASET_API_URL.`);
  server.listen(port, host);
});

server.listen(port, host, () => {
  updateUiEnvApiUrl(port);
  console.log(`[agrochain-api] AgroChain Data & Telemetry API listening on http://${host}:${port}`);
  console.log(`[agrochain-api] Endpoints active: /health, /api/dataset/*, /api/iot/*, /api/analytics/*, /api/security/*`);
});
