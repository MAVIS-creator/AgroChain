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

    await page.goto("http://localhost:5173/");
    await expect(page.getByText("AgroChain").first()).toBeVisible();

    // Verify Log New Crop Batch is present
    await expect(page.getByRole("heading", { name: "Log New Crop Batch" })).toBeVisible();

    // Fill new batch form
    await page.getByPlaceholder("e.g. 20261001").fill("20268888");
    await page.getByPlaceholder("e.g. 3500").fill("4200");
    await page.getByPlaceholder("e.g. Ibadan, Oyo State").fill("Ibadan Farm Cluster");

    // Click submit
    await page.getByRole("button", { name: "Mint Crop Batch On-Chain" }).click();

    // Should give clean user feedback rather than unhandled exception
    await expect(
      page.getByText(
        /Please connect your MetaMask wallet|Connect MetaMask before|Wallet session is not fully initialized|Contract not ready/i,
      ),
    ).toBeVisible();

    expect(
      pageErrors.some((message) => message.includes("Cannot read properties of undefined (reading 'id')")),
    ).toBe(false);
    expect(
      consoleErrors.some((message) => message.includes("Cannot read properties of undefined (reading 'id')")),
    ).toBe(false);
  });

  test("Public consumer verification portal accessible without wallet login", async ({ page }) => {
    await page.goto("http://localhost:5173/");

    // Navigate to Verify Product tab
    await page.getByRole("button", { name: "Verify Product" }).first().click();

    await expect(page.getByText("Public Consumer Verification Portal")).toBeVisible();
    await expect(page.getByText("Verify Product Origin & Authenticity")).toBeVisible();
    await expect(page.getByRole("button", { name: "Verify Batch" })).toBeVisible();
  });
});
