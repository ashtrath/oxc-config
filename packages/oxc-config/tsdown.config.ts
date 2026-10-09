import { defineConfig } from 'tsdown'
import { StaleGuardRecorder } from 'tsdown-stale-guard'

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/lint/index.ts', 'src/fmt/index.ts', 'src/cli/index.ts'],
  exports: true,
  platform: 'node',
  plugins: [StaleGuardRecorder()],
  publint: true,
  shims: true,
})
