import type { ExternalPluginEntry, OxlintConfig } from 'oxlint'

import type { Awaitable } from '../shared/types'
import type { FactoryOptions, OxlintConfigItem } from './types'

import { createDefu } from 'defu'
import { isPackageExists } from 'local-pkg'
import { defineConfig } from 'oxlint'

import { isInEditorEnv, resolveIgnorePatterns } from '../shared/utils'
import {
  antislop,
  command,
  comments,
  disables,
  e18e,
  imports,
  javascript,
  jsdoc,
  jsx,
  nextjs,
  node,
  oxc,
  perfectionist,
  react,
  regexp,
  tailwindcss,
  typescript,
  unicorn,
  vitest,
} from './presets'

const mergeConfigs = createDefu((obj, key, value) => {
  if (
    (key === 'plugins' || key === 'ignorePatterns') &&
    Array.isArray(obj[key]) &&
    Array.isArray(value)
  ) {
    obj[key] = [...new Set([...obj[key], ...value])] as never
    return true
  }

  if (key === 'jsPlugins' && Array.isArray(obj[key]) && Array.isArray(value)) {
    const map = new Map<string, ExternalPluginEntry>()
    for (const item of [...obj[key], ...value] as ExternalPluginEntry[]) {
      if (!item) continue

      const id = typeof item === 'string' ? item : item.name || item.specifier
      if (!map.has(id)) map.set(id, item)
    }

    obj[key] = [...map.values()] as never
    return true
  }

  if (key === 'overrides') {
    const current = Array.isArray(obj[key]) ? obj[key] : obj[key] ? [obj[key]] : []
    const incoming = Array.isArray(value) ? value : value ? [value] : []
    obj[key] = [...current, ...incoming] as never
    return true
  }
})

/**
 * Creates an opinionated oxlint configuration combining built-in presets and user overrides.
 *
 * @remarks
 *   Assembles linting presets based on project environment and specified options. User
 *   configuration items passed after `options` take precedence over preset defaults.
 * @example
 *   ;```ts
 *   import ashtrathLint from '@ashtrath/oxc-config/lint'
 *
 *   export default ashtrathLint({
 *     type: 'lib',
 *     typescript: true,
 *   })
 *   ```
 *
 * @param options - Factory configuration options for enabling, disabling, and tuning presets.
 * @param userConfigs - Additional oxlint configuration objects, arrays, or falsy values to merge.
 * @returns Fully merged oxlint configuration object.
 */
export async function ashtrathLint(
  options: FactoryOptions = {},
  ...userConfigs: Awaitable<OxlintConfigItem>[]
): Promise<OxlintConfig> {
  const {
    type: projectType = 'app',
    perfectionist: enablePerfectionist = true,
    node: enableNode = true,
    jsdoc: enableJsdoc = true,
    import: enableImport = true,
    e18e: enableE18e = true,
    unicorn: enableUnicorn = true,
    jsx: enableJsx = true,
    typescript: enableTypescript = isPackageExists('typescript') ||
      isPackageExists('@typescript/native-preview'),
    antislop: enableAntiSlop = false,
    regexp: enableRegexp = true,
    vitest: enableVitest = true,
    react: enableReact = isPackageExists('react'),
    nextjs: enableNextJs = isPackageExists('next'),
    tailwindcss: enableTailwindCSS = isPackageExists('tailwindcss'),
    ignorePatterns: userIgnorePatterns = [],
  } = options

  let isInEditor = options.isInEditor
  if (isInEditor == null) {
    isInEditor = isInEditorEnv()
    if (isInEditor)
      console.warn('[@ashtrath/oxc-config] Detected running in editor, some rules are disabled.')
  }

  const baseConfig: OxlintConfig = {
    // Disable default configs
    categories: { correctness: 'off' },
    ignorePatterns: resolveIgnorePatterns(userIgnorePatterns, !enableTypescript),
    options: {
      reportUnusedDisableDirectives: 'error',
    },
  }

  const presets: Awaitable<OxlintConfigItem>[] = []
  presets.push(
    baseConfig,
    javascript({ isInEditor, ...resolveSubOptions(options, 'javascript') }),
    oxc(),
    comments(),
    command(),
  )

  if (enableNode) {
    presets.push(node())
  }

  if (enablePerfectionist) {
    presets.push(perfectionist(resolveSubOptions(options, 'perfectionist')))
  }

  if (enableJsdoc) {
    presets.push(jsdoc())
  }

  if (enableImport) {
    presets.push(imports(resolveSubOptions(options, 'import')))
  }

  if (enableE18e) {
    presets.push(e18e(resolveSubOptions(options, 'e18e')))
  }

  if (enableUnicorn) {
    presets.push(unicorn(resolveSubOptions(options, 'unicorn')))
  }

  if (enableJsx) {
    presets.push(jsx(resolveSubOptions(options, 'jsx')))
  }

  if (enableTypescript) {
    presets.push(typescript({ type: projectType, ...resolveSubOptions(options, 'typescript') }))
  }

  if (enableAntiSlop) {
    presets.push(antislop(resolveSubOptions(options, 'antislop')))
  }

  if (enableRegexp) {
    presets.push(regexp(resolveSubOptions(options, 'regexp')))
  }

  if (enableVitest) {
    presets.push(vitest(resolveSubOptions(options, 'vitest')))
  }

  if (enableReact) {
    presets.push(react(resolveSubOptions(options, 'react')))
  }

  if (enableNextJs) {
    presets.push(nextjs(resolveSubOptions(options, 'nextjs')))
  }

  if (enableTailwindCSS) {
    presets.push(tailwindcss(resolveSubOptions(options, 'tailwindcss')))
  }

  presets.push(disables())

  // TODO: Refactor this config resolution abomination
  const [resolvedUserConfigs, resolvedPresets] = await Promise.all([
    Promise.all(userConfigs),
    Promise.all(presets),
  ])

  // HACK: defu prioritizes left-to-right: defu(HighestPriority, LowestPriority)
  // If a user passes: oxlint({}, configA, configB) -> configB should win.
  // So we reverse the user configs, then append the reversed presets.
  const configs: OxlintConfigItem[] = [
    ...((resolvedUserConfigs as any[])
      .flat(Infinity)
      .filter(Boolean)
      .reverse() as OxlintConfigItem[]),
    ...((resolvedPresets as any[]).flat(Infinity).filter(Boolean).reverse() as OxlintConfigItem[]),
  ]
  const merged = configs.reduce<OxlintConfig>(
    (acc, cur) => mergeConfigs(acc, (cur ?? {}) as OxlintConfig),
    {} as OxlintConfig,
  )

  return defineConfig(merged)
}

type ResolvedOptions<T> = T extends boolean ? Record<string, never> : NonNullable<T>

function resolveSubOptions<K extends keyof FactoryOptions>(
  options: FactoryOptions,
  key: K,
): ResolvedOptions<FactoryOptions[K]> {
  const value = options[key]
  if (typeof value === 'boolean' || value == null) {
    return {} as ResolvedOptions<FactoryOptions[K]>
  }
  return value as ResolvedOptions<FactoryOptions[K]>
}
