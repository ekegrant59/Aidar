import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  // clean only on full builds, not on every watch rebuild. Wiping dist mid-watch
  // briefly removes index.d.ts and races the api/web type-checkers.
  clean: false,
  sourcemap: false,
  target: "es2022",
});
