import { chromium } from "../ui/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const baseUrl = "http://127.0.0.1:5173";
const outputDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "screenshots");
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
await page.goto(`${baseUrl}/?page=verify&batchId=1003`, { waitUntil: "domcontentloaded" });
await page.getByRole("button", { name: "Verify Batch" }).click();
await page.getByRole("heading", { name: "Batch #1003" }).waitFor();
await page.screenshot({ path: path.join(outputDir, "02-public-verification-batch-1003.png"), fullPage: true });
await browser.close();
