import type { Rule } from '@oxlint/plugins'

import { maxCommentLength } from './max-comment-length'
import { noArrayFilterMap } from './no-array-filter-map'
import { noEmDash } from './no-em-dash'
import { noJargon } from './no-jargon'
import { noReduceAccumulatorCopy } from './no-reduce-accumulator-copy'
import { preferJsdoc } from './prefer-jsdoc'

export const rules = {
  'max-comment-length': maxCommentLength,
  'no-array-filter-map': noArrayFilterMap,
  'no-em-dash': noEmDash,
  'no-jargon': noJargon,
  'no-reduce-accumulator-copy': noReduceAccumulatorCopy,
  'prefer-jsdoc': preferJsdoc,
} satisfies Record<string, Rule>
