import { defineConfig } from 'tsdown'
import { StaleGuardRecorder } from 'tsdown-stale-guard'

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  exports: true,
  platform: 'node',
  plugins: [StaleGuardRecorder()],
  publint: true,
  deps: {
    neverBundle: ['@oxlint/plugins'],
  },
})
