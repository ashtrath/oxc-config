import type { OxlintOverride } from 'oxlint'

import { GLOB_SRC } from '../../shared/globs'
import { commandPlugin } from '../plugins'

export function command(): OxlintOverride[] {
  return [
    {
      files: [GLOB_SRC],
      jsPlugins: [commandPlugin],
      rules: {
        'command/command': 'error',
      },
    },
  ]
}
