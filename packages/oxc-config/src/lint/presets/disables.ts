import type { OxlintConfigItem } from '../types'

import { GLOB_SRC, GLOB_SRC_EXT } from '../../shared/globs'

export async function disables(): Promise<OxlintConfigItem> {
  return {
    overrides: [
      {
        files: [`**/scripts/${GLOB_SRC}`],
        rules: {
          'antfu/no-top-level-await': 'off',
          'no-console': 'off',
          'typescript/explicit-function-return-type': 'off',
        },
      },
      {
        files: [`**/cli/${GLOB_SRC}`, `**/cli.${GLOB_SRC_EXT}`],
        rules: {
          'antfu/no-top-level-await': 'off',
          'no-console': 'off',
        },
      },
      {
        files: ['**/bin/**/*', `**/bin.${GLOB_SRC_EXT}`],
        rules: {
          'antfu/no-import-dist': 'off',
          'antfu/no-import-node-modules-by-path': 'off',
        },
      },
      {
        files: ['**/*.d.?([cm])ts'],
        rules: {
          'oxlint-comments/no-unlimited-disable': 'off',
        },
      },
      {
        files: ['**/*.js', '**/*.cjs'],
        rules: {
          'typescript/no-require-imports': 'off',
        },
      },
      {
        files: [`**/*.config.${GLOB_SRC_EXT}`, `**/*.config.*.${GLOB_SRC_EXT}`],
        rules: {
          'antfu/no-top-level-await': 'off',
          'no-console': 'off',
          'typescript/explicit-function-return-type': 'off',
        },
      },
    ],
  }
}
