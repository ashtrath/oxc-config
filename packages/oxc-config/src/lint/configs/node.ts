import type { OxlintOverride } from 'oxlint'

import { GLOB_SRC } from '../../shared/globs'

export function node(): OxlintOverride[] {
  return [
    {
      files: [GLOB_SRC],
      plugins: ['node'],
      rules: {
        'node/handle-callback-err': ['error', '^(err|error)$'],
        'node/no-exports-assign': 'error',
        'node/no-new-require': 'error',
        'node/no-path-concat': 'error',

        // HACK: Oxlint lacks `n/prefer-global/*` rules
        // This is a known workaround documented at https://github.com/oxc-project/oxc/issues/493
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                allowTypeImports: true,
                group: ['buffer', 'node:buffer'],
                importNames: ['Buffer'],
                message: 'Use the global `Buffer` instead of importing it.',
              },
              {
                allowTypeImports: true,
                group: ['process', 'node:process'],
                message: 'Use the global `process` instead of importing it.',
              },
            ],
          },
        ],
      },
    },
  ]
}
