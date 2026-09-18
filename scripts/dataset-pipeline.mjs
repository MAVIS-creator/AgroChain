import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const rawDir = path.join(repoRoot, "data", "raw");
const processedDir = path.join(repoRoot, "data", "processed");

const CASSAVA_SOURCE_URLS = [
  {
    id: "owid-cassava-production",
    url: "https://ourworldindata.org/grapher/cassava-production.csv",
    metricType: "production",
    crop: "Cassava",
  },
  {
    id: "owid-cassava-yield",
    url: "https://ourworldindata.org/grapher/cassava-yields.csv",
    metricType: "yield",
    crop: "Cassava",
  },
];

const MAIZE_SOURCE_URLS = [
  {
    id: "owid-maize-production",
    url: "https://ourworldindata.org/grapher/maize-production.csv",
    metricType: "production",
    crop: "Maize",
  },
  {
    id: "owid-maize-yield",
    url: "https://ourworldindata.org/grapher/maize-yields.csv",
    metricType: "yield",
    crop: "Maize",
  },
];

const CASSAVA_FALLBACK_ROWS = [
  { region: "Nigeria", year: 2021, quantityTonnes: 60030000 },
  { region: "Ghana", year: 2021, quantityTonnes: 23100000 },
  { region: "Cameroon", year: 2021, quantityTonnes: 6500000 },
  { region: "Benin", year: 2021, quantityTonnes: 4200000 },
  { region: "Nigeria", year: 2022, quantityTonnes: 61400000 },
  { region: "Ghana", year: 2022, quantityTonnes: 23650000 },
  { region: "Cameroon", year: 2022, quantityTonnes: 6630000 },
  { region: "Benin", year: 2022, quantityTonnes: 4310000 },
  { region: "Nigeria", year: 2023, quantityTonnes: 62550000 },
  { region: "Ghana", year: 2023, quantityTonnes: 24100000 },
  { region: "Cameroon", year: 2023, quantityTonnes: 6720000 },
  { region: "Benin", year: 2023, quantityTonnes: 4390000 },
];

const MAIZE_FALLBACK_ROWS = [
  { region: "Nigeria", year: 2021, quantityTonnes: 12750000 },
  { region: "Ghana", year: 2021, quantityTonnes: 3200000 },
  { region: "Cameroon", year: 2021, quantityTonnes: 2200000 },
  { region: "Benin", year: 2021, quantityTonnes: 1650000 },
  { region: "Nigeria", year: 2022, quantityTonnes: 13100000 },
  { region: "Ghana", year: 2022, quantityTonnes: 3350000 },
  { region: "Cameroon", year: 2022, quantityTonnes: 2280000 },
  { region: "Benin", year: 2022, quantityTonnes: 1720000 },
  { region: "Nigeria", year: 2023, quantityTonnes: 13450000 },
  { region: "Ghana", year: 2023, quantityTonnes: 3450000 },
  { region: "Cameroon", year: 2023, quantityTonnes: 2350000 },
  { region: "Benin", year: 2023, quantityTonnes: 1790000 },
];

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const escapedQuote = inQuotes && line[i + 1] === '"';
      if (escapedQuote) {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result.map((value) => value.trim());
}

function parseCsv(csvText) {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = splitCsvLine(lines[i]);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    rows.push(row);
  }

  return rows;
}

function findHeaderKey(headerMap, matchers) {
  const keys = Object.keys(headerMap);
  const matched = keys.find((key) =>
    matchers.every((matcher) => key.includes(matcher)),
  );
  return matched ? headerMap[matched] : null;
}

function normalizeRows(rows, sourceMeta) {
  const normalized = [];
  const cropLower = sourceMeta.crop.toLowerCase();

  rows.forEach((row, index) => {
    const headerMap = Object.keys(row).reduce((acc, key) => {
      acc[key.toLowerCase()] = key;
      return acc;
    }, {});

    const region =
      row[headerMap.entity] ||
      row[headerMap.country] ||
      row[headerMap.region] ||
      row[headerMap.name] ||
      null;

    const yearRaw = row[headerMap.year] || row[headerMap.date] || null;
    const year = Number.parseInt(String(yearRaw || ""), 10);

    const productionKey = findHeaderKey(headerMap, [cropLower, "production"]);
    const yieldKey = findHeaderKey(headerMap, [cropLower, "yield"]);

    const valueRaw =
      (sourceMeta.metricType === "production"
        ? row[productionKey || ""]
        : row[yieldKey || ""]) ||
      row[productionKey || ""] ||
      row[yieldKey || ""] ||
      row[headerMap.value] ||
      row[headerMap.quantity] ||
      null;

    const numericValue = Number.parseFloat(
      String(valueRaw || "").replace(/,/g, ""),
    );

    if (!region || !Number.isFinite(year) || !Number.isFinite(numericValue)) {
      return;
    }

    const quantityTonnes = numericValue;
    const quantityKg = Math.max(0, Math.round(quantityTonnes * 1000));
    const qualityGrade =
      quantityTonnes > 20000000 ? "Grade A" : quantityTonnes > 7000000 ? "Grade B" : "Standard";
    const lossPct = Number((8 + ((year + index) % 6) * 0.9).toFixed(1));
    const transportHours = 10 + ((index + year) % 8);

    const prefix = sourceMeta.crop === "Maize" ? "MZ" : "CS";
    normalized.push({
      recordId: `${prefix}-${year}-${String(index + 1).padStart(3, "0")}`,
      batchId: `${year}${String((index % 90) + 10).padStart(2, "0")}`,
      region,
      year,
      cropType: sourceMeta.crop,
      productType:
        sourceMeta.metricType === "yield"
          ? `${sourceMeta.crop} Yield`
          : sourceMeta.crop === "Maize"
            ? "Maize Grain"
            : "Cassava Roots",
      quantityTonnes,
      quantityKg,
      qualityGrade,
      lossPct,
      transportHours,
      sourceType: `online-${sourceMeta.id}`,
      metricType: sourceMeta.metricType,
    });
  });

  return normalized;
}

function normalizeFallbackRows(rows, crop) {
  const prefix = crop === "Maize" ? "FB-MZ" : "FB-CS";
  return rows.map((row, index) => {
    const quantityKg = Math.round(row.quantityTonnes * 1000);
    const qualityGrade =
      row.quantityTonnes > 20000000
        ? "Grade A"
        : row.quantityTonnes > 7000000
          ? "Grade B"
          : "Standard";
    const lossPct = Number((8.2 + (index % 5) * 0.7).toFixed(1));
    const transportHours = 9 + (index % 7);

    return {
      recordId: `${prefix}-${row.year}-${String(index + 1).padStart(3, "0")}`,
      batchId: `${row.year}${String((index % 90) + 10).padStart(2, "0")}`,
      region: row.region,
      year: row.year,
      cropType: crop,
      productType: crop === "Maize" ? "Maize Grain" : "Cassava Roots",
      quantityTonnes: row.quantityTonnes,
      quantityKg,
      qualityGrade,
      lossPct,
      transportHours,
      sourceType: "fallback",
    };
  });
}

function summarize(records) {
  const totalRecords = records.length;
  const totalQuantityKg = records.reduce((acc, row) => acc + row.quantityKg, 0);
  const avgLossPct =
    totalRecords > 0
      ? Number(
          (
            records.reduce((acc, row) => acc + row.lossPct, 0) / totalRecords
          ).toFixed(2),
        )
      : 0;
  const avgTransportHours =
    totalRecords > 0
      ? Number(
          (
            records.reduce((acc, row) => acc + row.transportHours, 0) /
            totalRecords
          ).toFixed(2),
        )
      : 0;

  const byRegion = Object.entries(
    records.reduce((acc, row) => {
      acc[row.region] = (acc[row.region] || 0) + row.quantityKg;
      return acc;
    }, {}),
  )
    .map(([region, quantityKg]) => ({ region, quantityKg }))
    .sort((a, b) => b.quantityKg - a.quantityKg);

  const byCrop = {
    cassava: records.filter((r) => r.cropType === "Cassava").length,
    maize: records.filter((r) => r.cropType === "Maize").length,
  };

  return {
    totalRecords,
    totalQuantityKg,
    avgLossPct,
    avgTransportHours,
    byRegion,
    byCrop,
  };
}

async function fetchCropRows(sourceUrls, fallbackRows, crop) {
  let bestCandidate = null;

  for (const sourceMeta of sourceUrls) {
    try {
      const response = await fetch(sourceMeta.url, {
        headers: { "User-Agent": "agrochain-b2b-pipeline/1.0" },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) continue;

      const text = await response.text();
      const parsed = parseCsv(text);
      const normalized = normalizeRows(parsed, sourceMeta);

      if (normalized.length > 0) {
        const candidate = {
          records: normalized,
          rawCsv: text,
          sourceUrl: sourceMeta.url,
          sourceId: sourceMeta.id,
          usedFallback: false,
        };

        if (sourceMeta.metricType === "production") {
          return candidate;
        }
        if (!bestCandidate) {
          bestCandidate = candidate;
        }
      }
    } catch {
      // Continue to next URL
    }
  }

  if (bestCandidate) return bestCandidate;

  const fallbackRecords = normalizeFallbackRows(fallbackRows, crop);
  const fallbackCsv = [
    "region,year,quantityTonnes",
    ...fallbackRows.map((r) => `${r.region},${r.year},${r.quantityTonnes}`),
  ].join("\n");

  return {
    records: fallbackRecords,
    rawCsv: fallbackCsv,
    sourceUrl: "fallback-local-sample",
    sourceId: `fallback-${crop.toLowerCase()}`,
    usedFallback: true,
  };
}

async function run() {
  await mkdir(rawDir, { recursive: true });
  await mkdir(processedDir, { recursive: true });

  const cassavaData = await fetchCropRows(CASSAVA_SOURCE_URLS, CASSAVA_FALLBACK_ROWS, "Cassava");
  const maizeData = await fetchCropRows(MAIZE_SOURCE_URLS, MAIZE_FALLBACK_ROWS, "Maize");

  const combinedRecords = [...cassavaData.records, ...maizeData.records];
  const summary = summarize(combinedRecords);

  const payload = {
    generatedAt: new Date().toISOString(),
    ecosystem: "AgroChain: Smart Cassava & Maize Value Chain",
    source: {
      cassava: { url: cassavaData.sourceUrl, id: cassavaData.sourceId, fallback: cassavaData.usedFallback },
      maize: { url: maizeData.sourceUrl, id: maizeData.sourceId, fallback: maizeData.usedFallback },
    },
    summary,
    records: combinedRecords,
  };

  // Backwards compatible cassava payload
  const cassavaPayload = {
    generatedAt: payload.generatedAt,
    source: payload.source.cassava,
    summary: summarize(cassavaData.records),
    records: cassavaData.records,
  };

  await writeFile(path.join(rawDir, "cassava-dataset.csv"), cassavaData.rawCsv, "utf8");
  await writeFile(path.join(rawDir, "maize-dataset.csv"), maizeData.rawCsv, "utf8");
  await writeFile(path.join(processedDir, "agrochain-dataset.json"), JSON.stringify(payload, null, 2), "utf8");
  await writeFile(path.join(processedDir, "cassava-dataset.json"), JSON.stringify(cassavaPayload, null, 2), "utf8");

  console.log(`[dataset-pipeline] AgroChain total records: ${summary.totalRecords} (Cassava: ${summary.byCrop.cassava}, Maize: ${summary.byCrop.maize})`);
  console.log(`[dataset-pipeline] wrote: data/processed/agrochain-dataset.json`);
  console.log(`[dataset-pipeline] wrote: data/processed/cassava-dataset.json`);
}

run().catch((error) => {
  console.error("[dataset-pipeline] failed:", error);
  process.exitCode = 1;
});
