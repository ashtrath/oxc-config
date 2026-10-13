import type { ExternalPluginEntry } from 'oxlint'

import type { SlopConfig, SlopConfigOptions, SlopPresetName, SlopRules } from './types'

import { fileURLToPath } from 'node:url'

const PLUGIN: ExternalPluginEntry = {
  name: 'slop',
  specifier: fileURLToPath(import.meta.resolve('./index.mjs', import.meta.url)),
}

export const presets: Record<SlopPresetName, SlopRules> = {
  architecture: {
    'slop/no-chained-type-assertions': 'error',
    'slop/no-conditional-empty-object-spread': 'error',
    'slop/no-static-only-class': 'error',
    'slop/no-trivial-functions': 'error',
    'slop/no-trivial-type-aliases': 'error',
  },
  performance: {
    'slop/no-array-filter-map': 'error',
    'slop/no-reduce-accumulator-copy': 'error',
  },
  prose: {
    'slop/max-comment-length': 'warn',
    'slop/no-em-dash': 'warn',
    'slop/no-jargon': 'warn',
    'slop/prefer-jsdoc': 'warn',
  },
}

/**
 * Creates an Oxlint configuration object with `@ashtrath/oxlint-plugin-slop`.
 *
 * @example
 *   import { createSlopConfig } from '@ashtrath/oxlint-plugin-slop'
 *
 *   export default createSlopConfig({ preset: 'architecture' })
 *
 * @param options - Configuration options specifying preset selection and rule overrides.
 * @returns Configured `SlopConfig` object ready for Oxlint configuration.
 */
export function createSlopConfig(options: SlopConfigOptions = {}): SlopConfig {
  const mergedRules: SlopRules = {}

  if (options.presets) {
    for (const name of options.presets) {
      Object.assign(mergedRules, presets[name])
    }
  }

  if (options.rules) {
    Object.assign(mergedRules, options.rules)
  }

  return {
    jsPlugins: [PLUGIN],
    rules: mergedRules,
  }
}
