import type { Plugin } from '@oxlint/plugins'

import { eslintCompatPlugin } from '@oxlint/plugins'

import { rules } from './rules'

export const plugin: Plugin = eslintCompatPlugin({
  rules,
  meta: {
    name: '@ashtrath/oxlint-plugin-slop',
  },
})
