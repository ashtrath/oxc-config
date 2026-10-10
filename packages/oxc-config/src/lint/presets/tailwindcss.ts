import type { OxlintConfigItem, TailwindCSSOptions } from '../types'

import { tailwindcssPlugin } from '../plugins'

// TODO: Add dependency checking and prompt to install the package if its missing
export function tailwindcss(options: TailwindCSSOptions): OxlintConfigItem {
  const { overrides = {} } = options

  return {
    jsPlugins: [tailwindcssPlugin],
    rules: {
      'tailwindcss/consistent-variant-order': 'warn',
      'tailwindcss/enforce-canonical': 'warn',
      'tailwindcss/enforce-consistent-important-position': 'warn',
      'tailwindcss/enforce-consistent-variable-syntax': 'warn',
      'tailwindcss/enforce-negative-arbitrary-values': 'warn',
      'tailwindcss/enforce-shorthand': 'warn',
      'tailwindcss/no-contradicting-variants': 'warn',
      'tailwindcss/no-dark-without-light': 'warn',
      'tailwindcss/no-duplicate-classes': 'warn',
      'tailwindcss/no-hardcoded-colors': 'warn',
      'tailwindcss/no-unnecessary-arbitrary-value': 'warn',
      // 'tailwindcss/no-unnecessary-whitespace': 'warn', // Superseded by oxfmt's `sortTailwindcss.preserveWhitespace`

      // 'tailwindcss/enforce-sort-order': 'error', // Superseded by oxfmt's `sortTailwindcss`
      'tailwindcss/no-conflicting-classes': 'error',
      'tailwindcss/no-deprecated-classes': 'error',
      'tailwindcss/no-dynamic-classes': 'error',
      'tailwindcss/no-unknown-classes': 'error',

      ...overrides,
    },
  }
}
