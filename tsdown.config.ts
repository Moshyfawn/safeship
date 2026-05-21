import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  platform: "node",
  clean: true,
  treeshake: true,
  publint: "ci-only",
  failOnWarn: "ci-only",
});
