import type { OxlintOverride } from 'oxlint'

import type { UnicornOptions } from '../types'

import { GLOB_SRC } from '../../shared/globs'

export function unicorn(options: UnicornOptions): OxlintOverride[] {
  const { overrides = {} } = options

  return [
    {
      files: [GLOB_SRC],
      plugins: ['unicorn'],
      rules: {
        'unicorn/consistent-empty-array-spread': 'error',
        'unicorn/error-message': 'error',
        'unicorn/escape-case': 'error',
        'unicorn/new-for-builtins': 'error',
        'unicorn/no-instanceof-builtins': 'error',
        'unicorn/no-new-array': 'error',
        // FIXME: Enable this when https://github.com/oxc-project/oxc/pull/27442 get merged
        'unicorn/number-literal-case': 'off',
        'unicorn/prefer-dom-node-text-content': 'error',
        'unicorn/prefer-includes': 'error',
        'unicorn/prefer-node-protocol': 'error',
        'unicorn/prefer-number-properties': 'error',
        'unicorn/prefer-string-starts-ends-with': 'error',
        'unicorn/prefer-type-error': 'error',
        'unicorn/throw-new-error': 'error',

        ...overrides,
      },
    },
  ]
}
