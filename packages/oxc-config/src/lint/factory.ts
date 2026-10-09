import type { OxlintConfig, OxlintOverride } from 'oxlint'

import type { FactoryOptions } from './types'

import { isPackageExists } from 'local-pkg'
import { defineConfig } from 'oxlint'

import { isInEditorEnv, resolveIgnorePatterns } from '../shared/utils'
import {
  command,
  comments,
  e18e,
  imports,
  javascript,
  jsdoc,
  jsx,
  nextjs,
  node,
  perfectionist,
  regexp,
  tailwindcss,
  typescript,
  unicorn,
  vitest,
} from './configs'
import { react } from './configs/react'

export function ashtrathLint(
  options: FactoryOptions = {},
  ...userOverrides: OxlintOverride[]
): OxlintConfig {
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
      console.info('[@ashtrath/oxc-config] Detected running in editor, some rules are disabled.')
  }

  const configs: OxlintOverride[] = []

  configs.push(
    ...javascript({ isInEditor, ...resolveSubOptions(options, 'javascript') }),
    ...comments(),
    ...command(),
  )

  if (enableNode) {
    configs.push(...node())
  }

  if (enablePerfectionist) {
    configs.push(...perfectionist(resolveSubOptions(options, 'perfectionist')))
  }

  if (enableJsdoc) {
    configs.push(...jsdoc())
  }

  if (enableImport) {
    configs.push(...imports(resolveSubOptions(options, 'import')))
  }

  if (enableE18e) {
    configs.push(...e18e(resolveSubOptions(options, 'e18e')))
  }

  if (enableUnicorn) {
    configs.push(...unicorn(resolveSubOptions(options, 'unicorn')))
  }

  if (enableJsx) {
    configs.push(...jsx(resolveSubOptions(options, 'jsx')))
  }

  if (enableTypescript) {
    configs.push(...typescript({ type: projectType, ...resolveSubOptions(options, 'typescript') }))
  }

  // FIXME: Implement this
  if (enableAntiSlop) {
    configs.push()
  }

  if (enableRegexp) {
    configs.push(...regexp(resolveSubOptions(options, 'regexp')))
  }

  if (enableVitest) {
    configs.push(...vitest(resolveSubOptions(options, 'vitest')))
  }

  if (enableReact) {
    configs.push(...react(resolveSubOptions(options, 'react')))
  }

  if (enableNextJs) {
    configs.push(...nextjs(resolveSubOptions(options, 'nextjs')))
  }

  if (enableTailwindCSS) {
    configs.push(...tailwindcss(resolveSubOptions(options, 'tailwindcss')))
  }

  return defineConfig({
    categories: { correctness: 'off' },
    ignorePatterns: resolveIgnorePatterns(userIgnorePatterns, !enableTypescript),
    overrides: [...configs, ...userOverrides],
    options: {
      reportUnusedDisableDirectives: 'error',
    },
  })
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
