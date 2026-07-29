import { defineConfig } from "@playwright/test";

/** Smoke harness: drives the film the way a visitor does, on the system
 *  Chrome (`channel`) so neither CI nor a laptop downloads a browser. The
 *  production server must be built beforehand (`pnpm build`). */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 120_000,
  expect: { timeout: 20_000 },
  // One worker: the film is one long stateful traversal, and CI GPUs are weak.
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome",
    viewport: { width: 1280, height: 800 },
    trace: "retain-on-failure",
    // The film is French-first, and headless Chrome ships WITHOUT WebGL2
    // unless the software rasterizer is explicitly allowed — without these
    // the app (correctly) serves the accessible fallback instead.
    locale: "fr-FR",
    launchOptions: {
      args: ["--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
    },
  },
  webServer: {
    command: "pnpm start",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
