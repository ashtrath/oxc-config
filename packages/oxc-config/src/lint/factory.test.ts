import { describe, expect, it } from 'vitest'

import { antislop } from './configs'
import { ashtrathLint } from './factory'
import { reactDoctorPlugin, tailwindcssPlugin } from './plugins'

describe('ashtrathLint factory', () => {
  it('defines optional plugin specifiers as lazy getters to avoid eager resolution', () => {
    const tailwindDesc = Object.getOwnPropertyDescriptor(tailwindcssPlugin, 'specifier')
    expect(tailwindDesc?.get).toBeTypeOf('function')

    const reactDoctorDesc = Object.getOwnPropertyDescriptor(reactDoctorPlugin, 'specifier')
    expect(reactDoctorDesc?.get).toBeTypeOf('function')
  })

  it('generates valid OxlintConfig under default options', () => {
    const config = ashtrathLint()
    expect(config).toBeDefined()
    expect(config.categories).toEqual({ correctness: 'off' })
    expect(config.options).toEqual({ reportUnusedDisableDirectives: 'error' })
    expect(config.overrides).toBeInstanceOf(Array)
    expect(config.overrides?.length).toBeGreaterThan(0)
  })

  it('keeps antislop as a dormant no-op returning an empty override set when disabled', () => {
    const configWithoutSlop = ashtrathLint({ antislop: false })
    const hasSlopRules = configWithoutSlop.overrides?.some(o =>
      Object.keys(o.rules ?? {}).some(r => r.startsWith('slop/')),
    )
    expect(hasSlopRules).toBe(false)
  })

  it('applies customized option flags without module resolution failures', () => {
    const customConfig = ashtrathLint({
      antislop: false,
      nextjs: false,
      react: true,
      tailwindcss: false,
      typescript: true,
    })
    expect(customConfig).toBeDefined()
    expect(customConfig.overrides).toBeInstanceOf(Array)
    expect(customConfig.overrides?.length).toBeGreaterThan(0)
  })

  it('antislop configuration returns an empty override set', () => {
    expect(antislop()).toEqual([])
    expect(antislop({ slop: true })).toEqual([])
  })

  it('returns valid config with empty override set when antislop is enabled', () => {
    const configWithSlop = ashtrathLint({ antislop: true })
    expect(configWithSlop).toBeDefined()
    const hasSlopRules = configWithSlop.overrides?.some(o =>
      Object.keys(o.rules ?? {}).some(r => r.startsWith('slop/')),
    )
    expect(hasSlopRules).toBe(false)
  })

  it('omits tailwindcss overrides when tailwindcss is disabled', () => {
    const config = ashtrathLint({ tailwindcss: false })
    const hasTailwindPlugin = config.overrides?.some(o =>
      o.jsPlugins?.some(p => typeof p === 'object' && p.name === 'tailwindcss'),
    )
    expect(hasTailwindPlugin).toBe(false)
  })

  it('includes tailwindcss plugin entry when tailwindcss is enabled', () => {
    const config = ashtrathLint({ tailwindcss: true })
    const tailwindOverride = config.overrides?.find(o =>
      o.jsPlugins?.some(p => typeof p === 'object' && p.name === 'tailwindcss'),
    )
    expect(tailwindOverride).toBeDefined()
    const plugin = tailwindOverride?.jsPlugins?.find(
      p => typeof p === 'object' && p.name === 'tailwindcss',
    )
    expect(plugin).toBeDefined()
    expect(typeof plugin === 'object' && typeof plugin.specifier === 'string').toBe(true)
  })
})
