import type { OxlintOverride } from 'oxlint'

import { GLOB_SRC } from '../../shared/globs'
import { oxlintCommentsPlugin } from '../plugins'

export function comments(): OxlintOverride[] {
  return [
    {
      files: [GLOB_SRC],
      jsPlugins: [oxlintCommentsPlugin],
      rules: {
        'oxlint-comments/no-aggregating-enable': 'error',
        'oxlint-comments/no-duplicate-disable': 'error',
        'oxlint-comments/no-unlimited-disable': 'error',
        'oxlint-comments/no-unsupported-directive': 'warn',
        'oxlint-comments/require-description': 'error',
      },
    },
  ]
}
