import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/** Pure-logic tests only (node environment, no DOM): the world's math, the
 *  act mapping, the seeded randomness, the FR/EN parity — everything that
 *  can break silently without a pixel changing. */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
