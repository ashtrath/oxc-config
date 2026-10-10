import type { ExtraLibrariesOption, FrameworkOption, RunOptions, RunResult } from './types'

import { detectPackageManager } from '@antfu/install-pkg'
import * as p from '@clack/prompts'
import c from 'ansis'
import path from 'node:path'

import { version } from '../../package.json'
import { EXTRA_OPTIONS, FRAMEWORK_OPTIONS } from './constants'
import { updateConfigFiles } from './steps/update-config-files'
import { updatePackageJson } from './steps/update-package-json'
import { updateVScodeSettings } from './steps/update-vscode-settings'
import { fileExists, isGitClean } from './utils'

export async function run(options: RunOptions = {}): Promise<void> {
  console.log('\n')
  p.intro(`${c.bgGreen.bold(' @ashtrath/oxc-config ')} ${c.dim(`v${version}`)}`)

  const targetDir = path.resolve(options.cwd ?? process.cwd())
  const packageJsonExists = await fileExists(path.join(targetDir, 'package.json'))

  if (!packageJsonExists) {
    p.log.error(
      'No package.json found. Please initialize a package.json before running oxc-config.',
    )
    process.exit(1)
  }

  const oxlintExists = await fileExists(path.join(targetDir, 'oxlint.config.ts'))
  const oxfmtExists = await fileExists(path.join(targetDir, 'oxfmt.config.ts'))

  if (oxlintExists || oxfmtExists) {
    const existing = [oxlintExists && 'oxlint.config.ts', oxfmtExists && 'oxfmt.config.ts']
      .filter(Boolean)
      .join(', ')

    p.log.warn(`Found existing config (${existing}). Migration cancelled.`)
    process.exit(1)
  }

  const packageManager = (await detectPackageManager(targetDir)) ?? 'npm'
  p.log.info(`Using ${c.green.bold(packageManager)} based on your lockfile`)

  let results: RunResult = {
    cwd: targetDir,
    extra: [],
    frameworks: [],
    uncommittedConfirmed: false,
    updateVscodeSettings: false,
  }

  results = (await p.group(
    {
      uncommittedConfirmed: () => {
        if (isGitClean()) return Promise.resolve(true)

        return p.confirm({
          initialValue: false,
          message: 'Working tree has uncommitted changes. Continue anyway?',
        })
      },

      frameworks: ({ results }) => {
        if (!results.uncommittedConfirmed) return

        return p.multiselect<FrameworkOption>({
          message: 'Select frameworks to configure:',
          options: FRAMEWORK_OPTIONS,
          required: false,
        })
      },

      extra: ({ results }) => {
        if (!results.uncommittedConfirmed) return

        return p.multiselect<ExtraLibrariesOption>({
          message: 'Select additional tools to configure:',
          options: EXTRA_OPTIONS,
          required: false,
        })
      },

      updateVscodeSettings: ({ results }) => {
        if (!results.uncommittedConfirmed) return

        return p.confirm({
          initialValue: true,
          message: 'Configure VS Code workspace settings (.vscode/settings.json)?',
        })
      },
    },
    {
      onCancel: () => {
        p.cancel('Cancelled.')
        process.exit(0)
      },
    },
  )) as RunResult

  if (!results.uncommittedConfirmed) return process.exit(1)

  await updatePackageJson(results)
  await updateConfigFiles(results)
  await updateVScodeSettings(results)

  p.outro(
    `Done! Run ${c.green.bold(`${packageManager} install`)} and ${c.green.bold(`${packageManager} run lint`)} to verify.`,
  )
}
