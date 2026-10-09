import type { OxlintOverride } from 'oxlint'

import type { ImportOptions } from '../types'

import { GLOB_SRC } from '../../shared/globs'
import { antfuPlugin } from '../plugins'

export function imports(options: ImportOptions): OxlintOverride[] {
  const { overrides = {} } = options

  return [
    {
      files: [GLOB_SRC],
      jsPlugins: [antfuPlugin],
      plugins: ['import'],
      rules: {
        'antfu/import-dedupe': 'error',
        'antfu/no-import-dist': 'error',
        'antfu/no-import-node-modules-by-path': 'error',

        'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
        'import/first': 'error',
        'import/newline-after-import': ['error', { count: 1 }],
        'import/no-duplicates': 'error',
        'import/no-mutable-exports': 'error',
        'import/no-named-default': 'error',

        ...overrides,
      },
    },
  ]
}
