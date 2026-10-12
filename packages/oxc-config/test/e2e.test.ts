import type { OxfmtFactoryOptions } from '../src/fmt'
import type { OxlintFactoryOptions } from '../src/lint'

import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { x } from 'tinyexec'
import { glob } from 'tinyglobby'
import { afterAll, beforeAll, describe, it } from 'vitest'

import ashtrathFmt from '../src/fmt'
import ashtrathLint from '../src/lint'

interface Scenario {
  name: string
  presets: {
    fmt: OxfmtFactoryOptions
    lint: OxlintFactoryOptions
  }
}

interface OxlintDiagnostic {
  code: string
  filename: string
  help?: string
  labels?: Array<{
    label?: string
    span: {
      column: number
      length: number
      line: number
      offset: number
    }
  }>
  message: string
  severity: string
  url?: string
}

interface OxlintResult {
  diagnostics: OxlintDiagnostic[]
  number_of_files: number
  number_of_rules: number
  start_time: number
  threads_count: number
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
        nextjs: true,
        react: true,
        tailwindcss: { entryPoint: 'src/styles.css' },
        typescript: true,
      },
    },
  },
  {
    name: 'tab-double',
    presets: {
      lint: {},
      fmt: {
        semi: true,
        singleQuote: false,
        tabWidth: 4,
        useTabs: true,
      },
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

const fixtureRoot = resolve('test/__fixtures__/e2e')
const snapshotRoot = resolve('test/__snapshots__/e2e')

let sandboxRoot: string
let fixtureFiles: string[] = []

beforeAll(async () => {
  sandboxRoot = await mkdtemp(resolve(tmpdir(), 'oxc-e2e-test-'))
  fixtureFiles = (await glob('**/*', { cwd: fixtureRoot, onlyFiles: true })).toSorted()
})

afterAll(async () => {
  if (sandboxRoot) {
    await rm(sandboxRoot, { force: true, recursive: true })
  }
})

function serializeDiagnostics(
  diagnostics: OxlintDiagnostic[],
  scenarioDir: string,
): OxlintDiagnostic[] {
  const normalizedBase = scenarioDir.replaceAll('\\', '/')

  const sorted = diagnostics.toSorted((a, b) => {
    const codeDiff = a.code.localeCompare(b.code)
    if (codeDiff !== 0) return codeDiff

    const fileDiff = a.filename.localeCompare(b.filename)
    if (fileDiff !== 0) return fileDiff

    const aLine = a.labels?.[0]?.span.line ?? 0
    const bLine = b.labels?.[0]?.span.line ?? 0
    if (aLine !== bLine) return aLine - bLine

    const aCol = a.labels?.[0]?.span.column ?? 0
    const bCol = b.labels?.[0]?.span.column ?? 0
    return aCol - bCol
  })

  const json = JSON.stringify(sorted)
    .replaceAll('\\\\', '/')
    .replaceAll(normalizedBase, '<sandbox>')

  return JSON.parse(json)
}

function normalizeNewlines(content: string): string {
  return content.replaceAll('\r\n', '\n')
}

describe('end-to-end sandbox fixtures', () => {
  it.for(scenarios)(
    'executes $name scenario and verifies snapshot diffs',
    async ({ name, presets }, { expect }) => {
      const scenarioDir = resolve(sandboxRoot, name)
      const scenarioSnapshotDir = resolve(snapshotRoot, name)

      await rm(scenarioDir, { force: true, recursive: true })
      await cp(fixtureRoot, scenarioDir, { recursive: true })

      const [lintConfig, fmtConfig] = await Promise.all([
        ashtrathLint(presets.lint),
        ashtrathFmt(presets.fmt),
      ])

      const lintConfigPath = resolve(scenarioDir, 'oxlint.json')
      const fmtConfigPath = resolve(scenarioDir, 'oxfmt.json')

      await Promise.all([
        writeFile(lintConfigPath, JSON.stringify(lintConfig, null, 2)),
        writeFile(fmtConfigPath, JSON.stringify(fmtConfig, null, 2)),
      ])

      const auditResult = await x(
        'bunx',
        ['oxlint', '--format', 'json', '-c', lintConfigPath, '.'],
        {
          nodeOptions: { cwd: scenarioDir },
          throwOnError: false,
        },
      )

      const report = JSON.parse(auditResult.stdout || '{"diagnostics":[]}') as OxlintResult
      const diagnostics = serializeDiagnostics(report.diagnostics || [], scenarioDir)
      const diagSnapshotPath = resolve(scenarioSnapshotDir, 'diagnostics.json')

      await expect(JSON.stringify(diagnostics, null, 2)).toMatchFileSnapshot(diagSnapshotPath)

      await x('bunx', ['oxfmt', '-c', fmtConfigPath, '--write'], {
        nodeOptions: { cwd: scenarioDir },
        throwOnError: true,
      })

      await x('bunx', ['oxlint', '-c', lintConfigPath, '--fix'], {
        nodeOptions: { cwd: scenarioDir },
        throwOnError: false,
      })

      for (const file of fixtureFiles) {
        const originalPath = resolve(fixtureRoot, file)
        const outputPath = resolve(scenarioDir, file)
        const fileSnapshotPath = resolve(scenarioSnapshotDir, file)

        const original = normalizeNewlines(await readFile(originalPath, 'utf8'))
        const modified = normalizeNewlines(await readFile(outputPath, 'utf8'))

        if (modified === original) {
          expect(modified).toBe(original)
        } else {
          await expect(modified).toMatchFileSnapshot(fileSnapshotPath)
        }
      }
    },
  )
})
