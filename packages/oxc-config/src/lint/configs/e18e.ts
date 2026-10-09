import type { OxlintOverride } from 'oxlint'

import type { E18eOptions } from '../types'

import { GLOB_SRC } from '../../shared/globs'
import { e18ePlugin } from '../plugins'

export function e18e(options: E18eOptions): OxlintOverride[] {
  const {
    type = 'app',
    isInEditor = false,
    modernization = true,
    moduleReplacements = type === 'lib' && isInEditor,
    performanceImprovements = true,
    overrides = {},
  } = options

  return [
    {
      files: [GLOB_SRC],
      jsPlugins: [e18ePlugin],
      plugins: ['unicorn'],
      rules: {
        ...(modernization
          ? {
              'e18e/prefer-array-fill': 'error',
              'e18e/prefer-url-canparse': 'error',

              'prefer-exponentiation-operator': 'error', // Native equivalent for `e18e/prefer-exponentiation-operator`
              'prefer-nullish-coalescing': 'error', // Native equivalent for `e18e/prefer-nullish-coalescing`
              'prefer-object-has-own': 'error', // Native equivalent for `e18e/prefer-object-has-own`
              'unicorn/prefer-includes': 'error', // Native equivalent for `e18e/prefer-includes`
            }
          : {}),

        ...(moduleReplacements
          ? {
              'e18e/ban-dependencies': 'error',
            }
          : {}),

        ...(performanceImprovements
          ? {
              'e18e/prefer-string-fromcharcode': 'error',
              'e18e/prefer-timer-args': 'error',

              ...(type === 'lib'
                ? {
                    'e18e/prefer-static-regex': 'error',
                  }
                : {}),

              'unicorn/prefer-array-some': 'error', // Native equivalent for `e18e/prefer-array-some`
              'unicorn/prefer-date-now': 'error', // Native equivalent for `e18e/prefer-date-now`
              'unicorn/prefer-regexp-test': 'error', // Native equivalent for `e18e/prefer-regex-test`
            }
          : {}),

        ...overrides,
      },
    },
  ]
}
