import type { OxlintConfigItem } from '../types'

import { oxlintCommentsPlugin } from '../plugins'

export async function comments(): Promise<OxlintConfigItem> {
  return {
    jsPlugins: [oxlintCommentsPlugin],
    rules: {
      'oxlint-comments/no-aggregating-enable': 'error',
      'oxlint-comments/no-duplicate-disable': 'error',
      'oxlint-comments/no-unlimited-disable': 'error',
      'oxlint-comments/no-unsupported-directive': 'warn',
      'oxlint-comments/require-description': 'error',
    },
  }
}
