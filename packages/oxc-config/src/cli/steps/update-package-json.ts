import type { RunResult } from '../types'

import * as p from '@clack/prompts'
import fsp from 'node:fs/promises'
import path from 'node:path'

import { DEPENDENCIES_MAP, STANDARD_SCRIPTS } from '../constants'
import { VERSIONS_MAP } from '../constants.generated'

function detectIndent(content: string): string | number {
  const match = content.match(/^[ \t]+(?=")/m)
  return match ? match[0] : 2
}

export async function updatePackageJson(results: RunResult): Promise<void> {
  const targetDir = path.resolve(results.cwd)
  const packageJsonPath = path.join(targetDir, 'package.json')

  const pkgContent = await fsp.readFile(packageJsonPath, 'utf-8')
  const pkg: {
    devDependencies?: Record<string, string>
    scripts?: Record<string, string>
  } = JSON.parse(pkgContent)

  const indent = detectIndent(pkgContent)
  const hasNewline = pkgContent.endsWith('\n')

  pkg.scripts ??= {}
  const scripts = pkg.scripts

  for (const [key, command] of Object.entries(STANDARD_SCRIPTS)) {
    const existing = scripts[key]

    if (existing === undefined || existing === command) {
      scripts[key] = command
      continue
    }

    const shouldReplace = await p.confirm({
      initialValue: false,
      message: `Script "${key}" already exists ("${existing}"). Overwrite with "${command}"?`,
    })

    if (p.isCancel(shouldReplace)) {
      p.cancel('Cancelled.')
      process.exit(1)
    }

    if (shouldReplace) scripts[key] = command
  }

  pkg.devDependencies ??= {}
  const devDependencies = pkg.devDependencies

  devDependencies['@ashtrath/oxc-config'] = VERSIONS_MAP['@ashtrath/oxc-config']
  devDependencies.oxfmt = VERSIONS_MAP.oxlint
  devDependencies.oxlint = VERSIONS_MAP.oxfmt

  for (const extra of results.extra) {
    const additionalPackages = DEPENDENCIES_MAP[extra]
    if (!additionalPackages) continue

    for (const pkgName of additionalPackages) {
      devDependencies[pkgName] = VERSIONS_MAP[pkgName]
    }
  }

  const s = p.spinner()
  s.start('Updating package.json')

  const output = JSON.stringify(pkg, null, indent) + (hasNewline ? '\n' : '')
  await fsp.writeFile(packageJsonPath, output, 'utf8')

  s.stop('Updated package.json')
}
