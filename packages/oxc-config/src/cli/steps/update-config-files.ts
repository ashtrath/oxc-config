import type { RunResult } from '../types'

import * as p from '@clack/prompts'
import fsp from 'node:fs/promises'
import path from 'node:path'

function formatConfigBody(configs: string[]): string {
  if (configs.length === 0) return ''
  return `${configs.map(line => `  ${line}`).join('\n')}\n`
}

function generateOxlintConfig(configs: string[]): string {
  const body = formatConfigBody(configs)
  return `import ashtrathLint from '@ashtrath/oxc-config/lint'

export default ashtrathLint({
${body}
})
`.trimStart()
}

function generateOxfmtConfig(configs: string[]): string {
  const body = formatConfigBody(configs)
  return `import ashtrathFmt from '@ashtrath/oxc-config/fmt'

export default ashtrathFmt({
${body}
})
`.trimStart()
}

export async function updateConfigFiles(results: RunResult): Promise<void> {
  const targetDir = path.resolve(results.cwd)

  const oxlintPath = path.join(targetDir, 'oxlint.config.ts')
  const oxfmtPath = path.join(targetDir, 'oxfmt.config.ts')

  const oxlintConfig: string[] = []
  const oxfmtConfig: string[] = []

  if (results.extra.includes('tailwindcss')) {
    oxlintConfig.push('tailwindcss: true,')
    oxfmtConfig.push('sortTailwindcss: true,')
  }

  for (const framework of results.frameworks) {
    oxlintConfig.push(`${framework}: true,`)
  }

  const s = p.spinner()
  s.start('Writing configuration files')

  await Promise.all([
    fsp.writeFile(oxlintPath, generateOxlintConfig(oxlintConfig)),
    fsp.writeFile(oxfmtPath, generateOxfmtConfig(oxfmtConfig)),
  ])

  s.stop('Configuration files created')
}
