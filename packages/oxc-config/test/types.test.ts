import type { OxfmtFactoryOptions } from '@ashtrath/oxc-config/fmt'
import type { OxlintConfigItem, TypedOxlintConfig } from '@ashtrath/oxc-config/lint'
import type { OxfmtConfig } from 'oxfmt'
import type { OxlintConfig } from 'oxlint'

import ashtrathFmt from '@ashtrath/oxc-config/fmt'
import ashtrathLint from '@ashtrath/oxc-config/lint'
import { assertType, describe, expectTypeOf, it } from 'vitest'

describe('static type assignability', () => {
  it('confirms ashtrathLint() return value is assignable to Oxlint core OxlintConfig', async () => {
    const lintResult = await ashtrathLint()

    assertType<OxlintConfig>(lintResult)
    expectTypeOf(lintResult).toExtend<OxlintConfig>()
    expectTypeOf(ashtrathLint()).resolves.toExtend<OxlintConfig>()
  })

  it('confirms ashtrathFmt() return value is assignable to Oxfmt core OxfmtConfig', () => {
    const fmtResult = ashtrathFmt()

    assertType<OxfmtConfig>(fmtResult)
    expectTypeOf(fmtResult).toExtend<OxfmtConfig>()
    expectTypeOf(ashtrathFmt).returns.toExtend<OxfmtConfig>()
  })
  it('confirms OxlintConfigItem and OxfmtFactoryOptions are compatible with config options', () => {
    expectTypeOf<TypedOxlintConfig>().toBeObject()
    expectTypeOf<OxlintConfigItem>().not.toBeNever()
    expectTypeOf<OxfmtFactoryOptions>().toBeObject()
  })
})
