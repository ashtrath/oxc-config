import type { ExternalPluginEntry } from 'oxlint'

import type { SlopConfig } from './types'

import { fileURLToPath } from 'node:url'

const PLUGIN: ExternalPluginEntry = {
  name: 'slop',
  specifier: fileURLToPath(import.meta.resolve('./index.mjs', import.meta.url)),
}

export function createSlopConfig(): SlopConfig {
  return {
    jsPlugins: [PLUGIN],
    rules: {},
  }
}
