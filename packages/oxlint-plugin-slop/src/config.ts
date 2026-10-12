import type { ExternalPluginEntry } from 'oxlint'

import type { SlopConfig, SlopConfigOptions, SlopRules } from './types'

import { fileURLToPath } from 'node:url'

/**
 * External Oxlint plugin entry for `@ashtrath/oxlint-plugin-slop`.
 */
export const PLUGIN: ExternalPluginEntry = {
  name: 'slop',
  specifier: fileURLToPath(import.meta.resolve('./index.mjs', import.meta.url)),
}

/**
 * Rule configuration dictionary for the `slop/prose` preset. Configures all four prose rules with
 * `warn` severity.
 */
export const proseRules: SlopRules = {
  'slop/max-comment-length': 'warn',
  'slop/no-em-dash': 'warn',
  'slop/no-jargon': 'warn',
  'slop/prefer-jsdoc': 'warn',
}

/**
 * Curated preset configuration for prose rules with `warn` severity.
 */
export const prosePreset: SlopConfig = {
  jsPlugins: [PLUGIN],
  rules: { ...proseRules },
}

/**
 * Available named presets in `@ashtrath/oxlint-plugin-slop`.
 */
export const presets = {
  prose: prosePreset,
  'slop/prose': prosePreset,
} as const

/**
 * Creates an Oxlint configuration object with `@ashtrath/oxlint-plugin-slop`.
 *
 * @example
 *   ;```ts
 *   import { createSlopConfig } from '@ashtrath/oxlint-plugin-slop'
 *
 *   export default createSlopConfig({ preset: 'prose' })
 *   ```
 *
 * @param options - Configuration options specifying preset selection and rule overrides.
 * @returns Configured `SlopConfig` object ready for Oxlint configuration.
 */
export function createSlopConfig(options: SlopConfigOptions = {}): SlopConfig {
  const presetConfig = options.preset ? presets[options.preset] : undefined
  const presetRules: SlopRules = presetConfig ? { ...presetConfig.rules } : {}

  return {
    jsPlugins: [PLUGIN],
    rules: {
      ...presetRules,
      ...options.rules,
    },
  }
}
