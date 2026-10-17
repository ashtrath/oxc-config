import type { OxlintConfig } from 'oxlint'

import type { OxfmtFactoryOptions } from '../src/fmt'
import type { OxlintFactoryOptions } from '../src/lint'

import { describe, it } from 'vitest'

import ashtrathFmt from '../src/fmt'
import ashtrathLint from '../src/lint'

interface Scenario {
  name: string
  presets: {
    fmt: OxfmtFactoryOptions
    lint: OxlintFactoryOptions
  }
}

const scenarios: Scenario[] = [
  {
    name: 'default',
    presets: {
      fmt: {},
      lint: {},
    },
  },
  {
    name: 'all',
    presets: {
      fmt: {
        sortTailwindcss: true,
      },
      lint: {
        antislop: true,
        nextjs: { reactDoctor: true },
        react: { reactDoctor: true },
        tailwindcss: { entryPoint: 'src/styles.css' },
        typescript: { typeAware: true },
      },
    },
  },
  {
    name: 'in-editor',
    presets: {
      fmt: {},
      lint: { isInEditor: true },
    },
  },
  {
    name: 'lib',
    presets: {
      fmt: {},
      lint: { type: 'lib' },
    },
  },
  {
    name: 'full-off',
    presets: {
      fmt: {
        jsdoc: false,
        sortImports: false,
        sortPackageJson: false,
        sortTailwindcss: false,
      },
      lint: {
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
  },
]

function serializeLintConfig(config: OxlintConfig): Record<string, unknown> {
  const clone: Record<string, unknown> = { ...config }

  if (config.plugins) {
    clone.plugins = [...config.plugins].toSorted()
  }

  if (config.jsPlugins) {
    clone.jsPlugins = config.jsPlugins.map(p => (typeof p === 'string' ? p : p.name)).toSorted()
  }

  if (config.rules) {
    clone.rules = Object.fromEntries(
      Object.entries(config.rules).toSorted(([a], [b]) => a.localeCompare(b)),
    )
  }

  if (config.overrides) {
    clone.overrides = config.overrides.map(serializeLintConfig)
  }

  return clone
}

describe('factory config snapshots', () => {
  it.concurrent.for(scenarios)('$name scenario', async ({ name, presets }, { expect }) => {
    const [lintConfig, fmtConfig] = await Promise.all([
      ashtrathLint(presets.lint),
      ashtrathFmt(presets.fmt),
    ])

    await Promise.all([
      expect(JSON.stringify(serializeLintConfig(lintConfig), null, 2)).toMatchFileSnapshot(
        `./__snapshots__/factory/${name}.lint.json`,
      ),
      expect(JSON.stringify(fmtConfig, null, 2)).toMatchFileSnapshot(
        `./__snapshots__/factory/${name}.fmt.json`,
      ),
    ])
  })
})
