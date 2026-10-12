import type { Rule } from '@oxlint/plugins'

import { maxCommentLength } from './max-comment-length'
import { noEmDash } from './no-em-dash'
import { noJargon } from './no-jargon'
import { preferJsdoc } from './prefer-jsdoc'

export const rules = {
  'max-comment-length': maxCommentLength,
  'no-em-dash': noEmDash,
  'no-jargon': noJargon,
  'prefer-jsdoc': preferJsdoc,
} satisfies Record<string, Rule>
