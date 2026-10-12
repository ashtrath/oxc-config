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

export type SlopPresetName = 'prose' | 'slop/prose'

export interface SlopConfigOptions {
  preset?: SlopPresetName
  recommended?: boolean
  rules?: SlopRules
}
