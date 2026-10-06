import { defineConfig } from "tsdown";
import { StaleGuardRecorder } from "tsdown-stale-guard";

export default defineConfig({
  platform: "node",
  entry: ["src/index.ts"],
  dts: true,
  shims: true,
  exports: true,
  publint: true,
  clean: true,
  plugins: [StaleGuardRecorder()],
});
