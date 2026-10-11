import { resolve } from 'node:path'
import { x } from 'tinyexec'
import { glob } from 'tinyglobby'
import { it } from 'vitest'

import { GLOB_SRC } from '../src/shared/globs'

interface OxlintDiagnostic {
  message: string
  code: string
  severity: string
  url?: string
  help?: string
  filename: string
  labels?: Array<{
    label?: string
    span: {
      column: number
      length: number
      line: number
      offset: number
    }
  }>
}

interface OxlintResult {
  diagnostics: OxlintDiagnostic[]
  number_of_files: number
  number_of_rules: number
  threads_count: number
  start_time: number
}

const fixtureRoot = resolve('test/__fixtures__/diagnostics')
const fixtureFiles = await glob(GLOB_SRC, {
  cwd: fixtureRoot,
  onlyFiles: true,
})

function serializeDiagnostics(diagnostics: OxlintDiagnostic[]): OxlintDiagnostic[] {
  return diagnostics
    .map(diagnostic => ({
      code: diagnostic.code,
      filename: diagnostic.filename.replaceAll('\\', '/'),
      labels: diagnostic.labels,
      message: diagnostic.message,
      severity: diagnostic.severity,
    }))
    .sort((a, b) => a.code.localeCompare(b.code))
}

it.for(fixtureFiles)('$file diagnostics snapshots', async (file, { expect }) => {
  const result = await x('bunx', ['oxlint', '--format', 'json', file], {
    throwOnError: false,
    nodeOptions: {
      cwd: fixtureRoot,
      stdio: 'pipe',
    },
  })

  const report = JSON.parse(result.stdout) as OxlintResult
  const diagnostics = serializeDiagnostics(report.diagnostics)

  await expect(diagnostics).toMatchFileSnapshot(
    resolve('test/__snapshots__/diagnostics', `${file}.snap.json`),
  )
})
