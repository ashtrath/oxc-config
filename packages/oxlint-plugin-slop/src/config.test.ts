import { RuleTester } from 'oxlint/plugins-dev'
import { describe, expect, it } from 'vitest'

import {
  architecturePreset,
  architectureRules,
  createSlopConfig,
  performancePreset,
  performanceRules,
  presets,
  prosePreset,
  proseRules,
} from './config'
import { rules } from './rules'

describe('slop/prose preset', () => {
  it('configures all four prose rules with warn severity', () => {
    expect(proseRules).toEqual({
      'slop/max-comment-length': 'warn',
      'slop/no-em-dash': 'warn',
      'slop/no-jargon': 'warn',
      'slop/prefer-jsdoc': 'warn',
    })

    expect(prosePreset.rules).toEqual(proseRules)
    expect(prosePreset.jsPlugins).toHaveLength(1)
    const firstPlugin = prosePreset.jsPlugins?.[0]
    expect(
      firstPlugin && typeof firstPlugin === 'object' && 'name' in firstPlugin && firstPlugin.name,
    ).toBe('slop')
  })

  it('exports preset in presets dictionary and createSlopConfig', () => {
    expect(presets.prose).toBe(prosePreset)
    expect(presets['slop/prose']).toBe(prosePreset)

    const config = createSlopConfig({ preset: 'prose' })
    expect(config.rules).toEqual(proseRules)

    const configWithPrefix = createSlopConfig({ preset: 'slop/prose' })
    expect(configWithPrefix.rules).toEqual(proseRules)
  })

  describe('runs all rules in the prose preset under RuleTester', () => {
    const ruleTester = new RuleTester()

    for (const [prefixedName, severity] of Object.entries(proseRules)) {
      it(`enforces warn severity for ${prefixedName}`, () => {
        expect(severity).toBe('warn')
      })

      const ruleName = prefixedName.replace(/^slop\//, '') as keyof typeof rules
      const rule = rules[ruleName]

      ruleTester.run(`slop/prose > ${ruleName}`, rule, {
        invalid: [],
        valid: ['const fine = true;'],
      })
    }
  })
})

describe('slop/performance preset', () => {
  it('configures both performance rules with error severity', () => {
    expect(performanceRules).toEqual({
      'slop/no-array-filter-map': 'error',
      'slop/no-reduce-accumulator-copy': 'error',
    })

    expect(performancePreset.rules).toEqual(performanceRules)
    expect(performancePreset.jsPlugins).toHaveLength(1)
    const firstPlugin = performancePreset.jsPlugins?.[0]
    expect(
      firstPlugin && typeof firstPlugin === 'object' && 'name' in firstPlugin && firstPlugin.name,
    ).toBe('slop')
  })

  it('exports preset in presets dictionary and createSlopConfig', () => {
    expect(presets.performance).toBe(performancePreset)
    expect(presets['slop/performance']).toBe(performancePreset)

    const config = createSlopConfig({ preset: 'performance' })
    expect(config.rules).toEqual(performanceRules)

    const configWithPrefix = createSlopConfig({ preset: 'slop/performance' })
    expect(configWithPrefix.rules).toEqual(performanceRules)
  })

  describe('runs all rules in the performance preset under RuleTester', () => {
    const ruleTester = new RuleTester()

    for (const [prefixedName, severity] of Object.entries(performanceRules)) {
      it(`enforces error severity for ${prefixedName}`, () => {
        expect(severity).toBe('error')
      })

      const ruleName = prefixedName.replace(/^slop\//, '') as keyof typeof rules
      const rule = rules[ruleName]

      ruleTester.run(`slop/performance > ${ruleName}`, rule, {
        invalid: [],
        valid: ['const fine = true;'],
      })
    }
  })
})

describe('slop/architecture preset', () => {
  it('configures all five architectural rules with error severity', () => {
    expect(architectureRules).toEqual({
      'slop/no-chained-type-assertions': 'error',
      'slop/no-conditional-empty-object-spread': 'error',
      'slop/no-static-only-class': 'error',
      'slop/no-trivial-functions': 'error',
      'slop/no-trivial-type-aliases': 'error',
    })

    expect(architecturePreset.rules).toEqual(architectureRules)
    expect(architecturePreset.jsPlugins).toHaveLength(1)
    const firstPlugin = architecturePreset.jsPlugins?.[0]
    expect(
      firstPlugin && typeof firstPlugin === 'object' && 'name' in firstPlugin && firstPlugin.name,
    ).toBe('slop')
  })

  it('exports preset in presets dictionary and createSlopConfig', () => {
    expect(presets.architecture).toBe(architecturePreset)
    expect(presets['slop/architecture']).toBe(architecturePreset)

    const config = createSlopConfig({ preset: 'architecture' })
    expect(config.rules).toEqual(architectureRules)

    const configWithPrefix = createSlopConfig({ preset: 'slop/architecture' })
    expect(configWithPrefix.rules).toEqual(architectureRules)
  })

  describe('runs all rules in the architecture preset under RuleTester', () => {
    const ruleTester = new RuleTester()

    const architectureViolations: Record<string, { code: string; messageId: string }> = {
      'no-chained-type-assertions': {
        code: 'const x = a as unknown as string;',
        messageId: 'chained',
      },
      'no-conditional-empty-object-spread': {
        code: 'const x = { ...(cond ? { a: 1 } : {}) };',
        messageId: 'avoid',
      },
      'no-static-only-class': {
        code: 'class Util { static run() {} }',
        messageId: 'staticOnly',
      },
      'no-trivial-functions': {
        code: 'const getName = (u: any) => u.name;\ngetName(a);',
        messageId: 'trivial',
      },
      'no-trivial-type-aliases': {
        code: 'type Raw = unknown;',
        messageId: 'unknown',
      },
    }

    for (const [prefixedName, severity] of Object.entries(architectureRules)) {
      it(`enforces error severity for ${prefixedName}`, () => {
        expect(severity).toBe('error')
      })

      const ruleName = prefixedName.replace(/^slop\//, '') as keyof typeof rules
      const rule = rules[ruleName]
      const violation = architectureViolations[ruleName]

      ruleTester.run(`slop/architecture > ${ruleName}`, rule, {
        valid: ['const fine = true;'],
        invalid: violation
          ? [{ code: violation.code, errors: [{ messageId: violation.messageId }] }]
          : [],
      })
    }
  })
})
