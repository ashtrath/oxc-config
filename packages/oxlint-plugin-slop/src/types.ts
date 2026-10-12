import type { DummyRule, OxlintConfig } from 'oxlint'

import type { rules } from './rules'

export type SlopRuleName = keyof typeof rules

export type SlopRules = Partial<Record<SlopRuleName, DummyRule | undefined>>

export interface SlopConfig {
  jsPlugins: OxlintConfig['jsPlugins']
  rules: SlopRules
}

export interface SlopConfigOptions {
  recommended?: boolean
  rules?: SlopRules
}
