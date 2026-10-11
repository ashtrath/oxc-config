import type { OxlintConfig } from 'oxlint'

import type { OxfmtFactoryOptions } from '../src/fmt'
import type { OxlintFactoryOptions } from '../src/lint'

import { it } from 'vitest'

import ashtrathFmt from '../src/fmt'
import ashtrathLint from '../src/lint'

interface Suite<T> {
  name: string
  presets: T
}

const lintSuites: Suite<OxlintFactoryOptions>[] = [
  {
    name: 'default',
    presets: {},
  },
  {
    name: 'full-off',
    presets: {
      antislop: false,
      e18e: false,
      import: false,
      jsdoc: false,
      jsx: false,
      nextjs: false,
      node: false,
      perfectionist: false,
      react: false,
      regexp: false,
      tailwindcss: false,
      typescript: false,
      unicorn: false,
      vitest: false,
    },
  },
  {
    name: 'full-on',
    presets: {
      antislop: true,
      e18e: true,
      import: true,
      jsdoc: true,
      node: true,
      perfectionist: true,
      regexp: true,
      tailwindcss: true,
      unicorn: true,
      vitest: true,
      jsx: {
        a11y: true,
      },
      nextjs: {
        reactDoctor: true,
      },
      react: {
        reactDoctor: true,
      },
      typescript: {
        typeAware: true,
      },
    },
  },
  {
    name: 'in-editor',
    presets: {
      isInEditor: true,
    },
  },
  {
    name: 'lib',
    presets: {
      type: 'lib',
    },
  },
]

const fmtSuites: Suite<OxfmtFactoryOptions>[] = [
  {
    name: 'default',
    presets: {},
  },
  {
    name: 'full-off',
    presets: {
      jsdoc: false,
      sortImports: false,
      sortPackageJson: false,
      sortTailwindcss: false,
    },
  },
  {
    name: 'full-on',
    presets: {
      jsdoc: true,
      sortImports: true,
      sortPackageJson: true,
      sortTailwindcss: true,
    },
  },
]

function serializeConfig(config: OxlintConfig): unknown {
  const clone = { ...config } as any

  if (config.plugins) {
    clone.plugins = [...config.plugins].sort()
  }

  if (config.jsPlugins) {
    clone.jsPlugins = config.jsPlugins.map(plugin =>
      typeof plugin === 'string' ? plugin : plugin.name,
    )
  }

  if (config.rules) {
    clone.rules = Object.fromEntries(
      Object.entries(config.rules).sort(([ruleA], [ruleB]) => ruleA.localeCompare(ruleB)),
    )
  }

  if (config.overrides) {
    clone.overrides = config.overrides.map(override => serializeConfig(override))
  }

  return clone
}

it.concurrent.for(lintSuites)(
  'ashtrathLint $name snapshots',
  async ({ name, presets }, { expect }) => {
    const config = await ashtrathLint(presets)
    await expect(serializeConfig(config)).toMatchFileSnapshot(
      `./__snapshots__/factory/lint/${name}.snap.json`,
    )
  },
)

it.concurrent.for(fmtSuites)(
  'ashtrathFmt $name snapshots',
  async ({ name, presets }, { expect }) => {
    const config = await ashtrathFmt(presets)
    await expect(serializeConfig(config)).toMatchFileSnapshot(
      `./__snapshots__/factory/fmt/${name}.snap.json`,
    )
  },
)
