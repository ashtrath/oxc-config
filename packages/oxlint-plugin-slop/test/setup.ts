import { RuleTester } from 'oxlint/plugins-dev'
import { describe, it } from 'vitest'

RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

RuleTester.setDefaultConfig({
  languageOptions: { parserOptions: { lang: 'ts' } },
})
