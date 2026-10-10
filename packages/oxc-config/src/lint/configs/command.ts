import type { OxlintConfigItem } from '../types'

import { commandPlugin } from '../plugins'

export function command(): OxlintConfigItem {
  return {
    jsPlugins: [commandPlugin],
    rules: {
      'command/command': 'error',
    },
  }
}
