import type { Rule } from '@oxlint/plugins'

import { maxCommentLength } from './max-comment-length'
import { noArrayFilterMap } from './no-array-filter-map'
import { noChainedTypeAssertions } from './no-chained-type-assertions'
import { noConditionalEmptyObjectSpread } from './no-conditional-empty-object-spread'
import { noEmDash } from './no-em-dash'
import { noJargon } from './no-jargon'
import { noReduceAccumulatorCopy } from './no-reduce-accumulator-copy'
import { noShapeInSymbolNames } from './no-shape-in-symbol-names'
import { noStaticOnlyClass } from './no-static-only-class'
import { noTrivialFunctions } from './no-trivial-functions'
import { noTrivialTypeAliases } from './no-trivial-type-aliases'
import { preferJsdoc } from './prefer-jsdoc'
import { requireSafetyCommentForTypeAssertion } from './require-safety-comment-for-type-assertion'

export const rules = {
  'max-comment-length': maxCommentLength,
  'no-array-filter-map': noArrayFilterMap,
  'no-chained-type-assertions': noChainedTypeAssertions,
  'no-conditional-empty-object-spread': noConditionalEmptyObjectSpread,
  'no-em-dash': noEmDash,
  'no-jargon': noJargon,
  'no-reduce-accumulator-copy': noReduceAccumulatorCopy,
  'no-shape-in-symbol-names': noShapeInSymbolNames,
  'no-static-only-class': noStaticOnlyClass,
  'no-trivial-functions': noTrivialFunctions,
  'no-trivial-type-aliases': noTrivialTypeAliases,
  'prefer-jsdoc': preferJsdoc,
  'require-safety-comment-for-type-assertion': requireSafetyCommentForTypeAssertion,
} satisfies Record<string, Rule>
