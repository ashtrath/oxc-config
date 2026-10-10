import type { OxlintConfigItem } from '../types'

import { commandPlugin } from '../plugins'

export async function command(): Promise<OxlintConfigItem> {
  return {
    jsPlugins: [commandPlugin],
    rules: {
      'command/command': 'error',
    },
  }
}
