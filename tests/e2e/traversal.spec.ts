import { expect, test, type Page } from "@playwright/test";

/** Console errors and uncaught exceptions collected for the whole journey —
 *  the assertion of record: a regression almost always screams here first. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    // Network failures reach the console as an anonymous "Failed to load
    // resource" — the response listener below reports those WITH their URL.
    if (message.text().startsWith("Failed to load resource")) return;
    // Same platform gap as the response listener below, seen from the other
    // end: locally /_vercel/insights/script.js 404s to an HTML page, and
    // `nosniff` makes Chrome refuse to run it rather than sniff it silently.
    // On Vercel that route answers with application/javascript, so this can
    // only ever fire on a local production server.
    if (message.text().includes("/_vercel/")) return;
    errors.push(message.text());
  });
  page.on("pageerror", (error) => {
    errors.push(String(error));
  });
  page.on("response", (response) => {
    if (response.status() < 400) return;
    const { pathname } = new URL(response.url());
    // Browsers probe /favicon.ico on direct navigation; the app serves its
    // icon via the App Router convention (/icon.svg) instead.
    if (pathname === "/favicon.ico") return;
    // Vercel Analytics is injected by the PLATFORM — the local production
    // server has no /_vercel/* routes, and that's expected.
    if (pathname.startsWith("/_vercel/")) return;
    errors.push(`HTTP ${response.status()} on ${response.url()}`);
  });
  return errors;
}

test("the film plays from the void to the dawn without a single error", async ({ page }) => {
  const errors = collectErrors(page);

  await page.goto("/");
  // Boot compiles the first acts behind the loading ring — generous wait,
  // CI renders WebGL on a software rasterizer.
  const enter = page.getByRole("button", { name: /entrer en silence/i });
  await expect(enter).toBeVisible({ timeout: 45_000 });
  await enter.click();

  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();

  // One checkpoint inside every act (and the boundaries that bit us before:
  // the forest mount at 0.15-0.20, the dive at 0.50, the emergence at 0.60).
  const checkpoints = [0.03, 0.12, 0.22, 0.3, 0.4, 0.5, 0.56, 0.605, 0.63, 0.7, 0.8, 0.93, 0.99];
  for (const p of checkpoints) {
    await page.evaluate((progress) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: max * progress, behavior: "instant" as ScrollBehavior });
    }, p);
    // Let the scrubbed timeline, lazy acts and warm-up settle.
    await page.waitForTimeout(900);
  }

  await expect(canvas).toBeVisible();
  expect(errors, `console/page errors during the traversal:\n${errors.join("\n")}`).toEqual([]);
});

test("the accessible fallback tells the whole story in both languages", async ({ page }) => {
  const errors = collectErrors(page);

  await page.goto("/fallback");
  await expect(page.getByText("Le Néant", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("L'Aube", { exact: false }).first()).toBeVisible();

  await page.goto("/fallback?lang=en");
  await expect(page.getByText("The Void", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("The Dawn", { exact: false }).first()).toBeVisible();

  expect(errors, `console/page errors on the fallback:\n${errors.join("\n")}`).toEqual([]);
});
