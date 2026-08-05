import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/** eslint-config-next ships flat config since Next 16 — wrapping it in
 *  FlatCompat, as this file used to, feeds it back into the legacy loader
 *  and throws on a circular plugin reference. It is imported directly. */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },

  /* The React Compiler rules that arrived with eslint-plugin-react-hooks v6
   * assume every value flows through a React render. The render layer is built
   * on the opposite premise: `useFrame` runs outside React entirely, and
   * mutating three.js objects and uniform proxies in place is precisely how it
   * holds zero React renders at 60 fps. Honouring these three rules here would
   * mean rewriting that architecture, not fixing a defect — so they are off in
   * the render layer, and stay on everywhere else. */
  {
    files: [
      "src/components/3d/**",
      "src/components/canvas/**",
      "src/lib/particles/**",
    ],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
    },
  },

  /* Four one-shot probes of a browser capability, deliberately read after
   * mount so the first render matches the server's and hydration stays clean —
   * each file says so in its own comment. The rule would have them read
   * through useSyncExternalStore, which buys nothing for a value that is
   * settled once and never changes. */
  {
    files: [
      "src/components/dom/Cursor.tsx",
      "src/components/dom/PhotoFlash.tsx",
      "src/hooks/useCoarse.ts",
      "src/hooks/useWebGLSupport.ts",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
