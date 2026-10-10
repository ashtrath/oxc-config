import type { OxlintConfigItem, VitestOptions } from '../types'

import { GLOB_TESTS } from '../../shared/globs'

export function vitest(options: VitestOptions): OxlintConfigItem {
  const { files = GLOB_TESTS, isInEditor = false, overrides = {} } = options

  return {
    overrides: [
      {
        files,
        plugins: ['vitest'],
        rules: {
          'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
          'vitest/expect-expect': 'error',
          'vitest/no-conditional-expect': 'error',
          'vitest/no-identical-title': 'error',
          'vitest/no-import-node-test': 'error',
          'vitest/no-interpolation-in-snapshots': 'error',
          'vitest/no-mocks-import': 'error',
          'vitest/no-standalone-expect': 'error',
          'vitest/no-unneeded-async-expect-function': 'error',
          'vitest/prefer-called-exactly-once-with': 'error',
          'vitest/prefer-hooks-in-order': 'error',
          'vitest/prefer-lowercase-title': 'error',
          'vitest/prefer-strict-boolean-matchers': 'error',
          'vitest/prefer-to-be': 'error',
          'vitest/valid-describe-callback': 'error',
          'vitest/valid-expect': 'error',
          'vitest/valid-expect-in-promise': 'error',
          'vitest/valid-title': 'error',

          'vitest/no-commented-out-tests': 'warn',
          'vitest/no-disabled-tests': 'warn',
          'vitest/no-focused-tests': isInEditor ? 'warn' : 'error',

          'antfu/no-top-level-await': 'off',
          'e18e/prefer-static-regex': 'off',
          'no-unused-expressions': 'off',
          'typescript/explicit-function-return-type': 'off',

          ...overrides,
        },
      },
    ],
  }
}
