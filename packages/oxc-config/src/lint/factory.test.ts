import type { ExternalPluginEntry } from 'oxlint'

import { describe, expect, it } from 'vitest'

import { antislop } from './configs'
import { ashtrathLint } from './factory'
import { reactDoctorPlugin, tailwindcssPlugin } from './plugins'

describe('ashtrathLint factory', () => {
  it('defines optional plugin entries with resolved specifiers', () => {
    const tailwindPlugin = tailwindcssPlugin as { name?: string; specifier?: string }
    const tailwindDesc = Object.getOwnPropertyDescriptor(tailwindPlugin, 'specifier')
    expect(tailwindDesc?.value).toBeTypeOf('string')
    expect(tailwindDesc?.get).toBeUndefined()
    expect(tailwindPlugin.name).toBe('tailwindcss')
    expect(typeof tailwindPlugin.specifier).toBe('string')

    const reactDoctor = reactDoctorPlugin as { name?: string; specifier?: string }
    const reactDoctorDesc = Object.getOwnPropertyDescriptor(reactDoctor, 'specifier')
    expect(reactDoctorDesc?.value).toBeTypeOf('string')
    expect(reactDoctorDesc?.get).toBeUndefined()
    expect(reactDoctor.name).toBe('react-doctor')
    expect(typeof reactDoctor.specifier).toBe('string')
  })

  it('generates valid OxlintConfig under default options', () => {
    const config = ashtrathLint()
    expect(config).toBeDefined()
    expect(config.categories).toEqual({ correctness: 'off' })
    expect(config.options).toEqual({ reportUnusedDisableDirectives: 'error' })
    expect(config.rules).toBeDefined()
    expect(Object.keys(config.rules ?? {}).length).toBeGreaterThan(0)
    expect(config.plugins).toBeInstanceOf(Array)
    expect(config.plugins?.length).toBeGreaterThan(0)
    expect(config.jsPlugins).toBeInstanceOf(Array)
    expect(config.jsPlugins?.length).toBeGreaterThan(0)
    expect(config.overrides).toBeInstanceOf(Array)
    expect(config.overrides?.length).toBeGreaterThan(0)
  })

  it('keeps antislop as a dormant no-op returning an empty config when disabled', () => {
    const configWithoutSlop = ashtrathLint({ antislop: false })
    const hasSlopRootRules = Object.keys(configWithoutSlop.rules ?? {}).some(r =>
      r.startsWith('slop/'),
    )
    expect(hasSlopRootRules).toBe(false)
    const hasSlopOverrideRules = configWithoutSlop.overrides?.some(o =>
      Object.keys(o.rules ?? {}).some(r => r.startsWith('slop/')),
    )
    expect(hasSlopOverrideRules).toBe(false)
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

  it('antislop configuration returns an empty config object', () => {
    expect(antislop()).toEqual({})
    expect(antislop({ slop: true })).toEqual({})
  })

  it('returns valid config with empty rules when antislop is enabled', () => {
    const configWithSlop = ashtrathLint({ antislop: true })
    expect(configWithSlop).toBeDefined()
    const hasSlopRootRules = Object.keys(configWithSlop.rules ?? {}).some(r =>
      r.startsWith('slop/'),
    )
    expect(hasSlopRootRules).toBe(false)
    const hasSlopOverrideRules = configWithSlop.overrides?.some(o =>
      Object.keys(o.rules ?? {}).some(r => r.startsWith('slop/')),
    )
    expect(hasSlopOverrideRules).toBe(false)
  })

  it('omits tailwindcss from root jsPlugins when tailwindcss is disabled', () => {
    const config = ashtrathLint({ tailwindcss: false })
    const hasTailwindPlugin = config.jsPlugins?.some(
      p => (typeof p === 'string' ? p : p.name) === 'tailwindcss',
    )
    expect(hasTailwindPlugin).toBe(false)
  })

  it('includes tailwindcss plugin entry in root jsPlugins when tailwindcss is enabled', () => {
    const config = ashtrathLint({ tailwindcss: true })
    const tailwindPlugin = config.jsPlugins?.find(
      p => typeof p === 'object' && p.name === 'tailwindcss',
    )
    expect(tailwindPlugin).toBeDefined()
    expect(typeof tailwindPlugin === 'object' && typeof tailwindPlugin.specifier === 'string').toBe(
      true,
    )

    const hasTailwindInOverrides = config.overrides?.some(o =>
      o.jsPlugins?.some(p => (typeof p === 'string' ? p : p.name) === 'tailwindcss'),
    )
    expect(hasTailwindInOverrides).toBe(false)
  })

  it('merges duplicate entries in plugins and ignorePatterns into unique lists', () => {
    const config = ashtrathLint(
      { ignorePatterns: ['**/custom-ignore/**', '**/custom-ignore/**'] },
      {
        ignorePatterns: ['**/custom-ignore/**', '**/another-ignore/**'],
        plugins: ['unicorn', 'typescript'],
      },
      {
        ignorePatterns: ['**/another-ignore/**', '**/third-ignore/**'],
        plugins: ['typescript', 'react'],
      },
    )

    const typescriptPluginCount = config.plugins?.filter(p => p === 'typescript').length
    expect(typescriptPluginCount).toBe(1)
    const unicornCount = config.plugins?.filter(p => p === 'unicorn').length
    expect(unicornCount).toBe(1)
    expect(new Set(config.plugins).size).toBe(config.plugins?.length)

    const customIgnoreCount = config.ignorePatterns?.filter(p => p === '**/custom-ignore/**').length
    expect(customIgnoreCount).toBe(1)
    const anotherIgnoreCount = config.ignorePatterns?.filter(
      p => p === '**/another-ignore/**',
    ).length
    expect(anotherIgnoreCount).toBe(1)
    expect(new Set(config.ignorePatterns).size).toBe(config.ignorePatterns?.length)
  })

  it('deduplicates jsPlugins sharing the same name or specifier', () => {
    const config = ashtrathLint(
      {},
      {
        jsPlugins: [
          { name: 'duplicate-by-name', specifier: '/path/first' },
          { specifier: '/path/duplicate-by-specifier' } as unknown as ExternalPluginEntry,
          'string-plugin',
        ],
      },
      {
        jsPlugins: [
          { name: 'duplicate-by-name', specifier: '/path/second' },
          { specifier: '/path/duplicate-by-specifier' } as unknown as ExternalPluginEntry,
          'string-plugin',
        ],
      },
    )

    const byName = config.jsPlugins?.filter(
      p => typeof p === 'object' && p.name === 'duplicate-by-name',
    )
    expect(byName).toHaveLength(1)

    const bySpecifier = config.jsPlugins?.filter(
      p => typeof p === 'object' && p.specifier === '/path/duplicate-by-specifier',
    )
    expect(bySpecifier).toHaveLength(1)

    const byString = config.jsPlugins?.filter(p => typeof p === 'string' && p === 'string-plugin')
    expect(byString).toHaveLength(1)
  })

  it('gives userConfigs precedence over default presets', () => {
    const defaultConfig = ashtrathLint()
    expect(defaultConfig.rules?.['eqeqeq']).toEqual(['error', 'smart'])

    const configWithUserOverride = ashtrathLint(
      {},
      { rules: { 'custom-user-rule': 'error', eqeqeq: 'off' } },
    )
    expect(configWithUserOverride.rules?.['eqeqeq']).toBe('off')
    expect(configWithUserOverride.rules?.['custom-user-rule']).toBe('error')

    const configWithMultipleUserConfigs = ashtrathLint(
      {},
      { rules: { eqeqeq: 'warn' } },
      { rules: { eqeqeq: 'off' } },
    )
    expect(configWithMultipleUserConfigs.rules?.['eqeqeq']).toBe('off')
  })
})
