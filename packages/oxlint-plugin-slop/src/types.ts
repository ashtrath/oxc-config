import type { DummyRule, OxlintConfig } from 'oxlint'

import type { rules } from './rules'

export type BareSlopRuleName = keyof typeof rules
export type PrefixedSlopRuleName = `slop/${BareSlopRuleName}`
export type SlopRuleName = BareSlopRuleName | PrefixedSlopRuleName

export type SlopRules = Partial<Record<SlopRuleName, DummyRule | undefined>>

export interface SlopConfig {
  jsPlugins: OxlintConfig['jsPlugins']
  rules: SlopRules
}

export type SlopPresetName = 'architecture' | 'performance' | 'prose'

export interface SlopConfigOptions {
  presets?: SlopPresetName[]
  rules?: SlopRules
}

export type { MaxCommentLengthOptions } from './rules/max-comment-length'
export type { NoArrayFilterMapOptions } from './rules/no-array-filter-map'
export type { NoJargonOptions } from './rules/no-jargon'
export type { NoTrivialFunctionsOptions } from './rules/no-trivial-functions'
export type { NoTrivialTypeAliasesOptions } from './rules/no-trivial-type-aliases'
export type { RequireSafetyCommentForTypeAssertionOptions } from './rules/require-safety-comment-for-type-assertion'
