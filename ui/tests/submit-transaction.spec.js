import { expect, test } from "@playwright/test";

test.describe("AgroChain End-to-End Workflow Tests", () => {
  test("AgroChain UI loads cleanly with branding and does not crash on uninitialized wallet", async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "AgroChain home" })).toBeVisible({ timeout: 20000 });

    // An uninitialized wallet must be stopped at the stakeholder entry gate.
    await page.goto("/?page=dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Enter AgroChain" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Connect Wallet" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Log New Crop Batch" })).toHaveCount(0);

    expect(
      pageErrors.some((message) => message.includes("Cannot read properties of undefined (reading 'id')")),
    ).toBe(false);
    expect(
      consoleErrors.some((message) => message.includes("Cannot read properties of undefined (reading 'id')")),
    ).toBe(false);
  });

  test("Public consumer verification portal accessible without wallet login", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Navigate to Verify Product tab
    await page.getByRole("button", { name: "Verify Product" }).first().click();

    await expect(page.getByText("Public Consumer Verification Portal")).toBeVisible();
    await expect(page.getByText("Verify Product Origin & Authenticity")).toBeVisible();
    await expect(page.getByRole("button", { name: "Verify Batch" })).toBeVisible();
  });
});
