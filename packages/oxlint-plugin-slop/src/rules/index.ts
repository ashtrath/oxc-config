import type { Rule } from '@oxlint/plugins'

import { noEmDash } from './no-em-dash'

export const rules = {
  'no-em-dash': noEmDash,
} satisfies Record<string, Rule>
