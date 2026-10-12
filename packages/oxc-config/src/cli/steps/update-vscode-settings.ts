import type { RunResult } from '../types'

import * as p from '@clack/prompts'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

const LAST_LINE_PATTERN = /\s*\}$/
const VSCODE_SETTINGS_STRING = `
  // Disable the default formatter, use oxc instead
  "prettier.enable": false,

  // Auto fix
  "editor.defaultFormatter": "oxc.oxc-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnSaveMode": "file", // Oxfmt does not support partial formatting
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit",
    "source.organizeImports": "never"
  },

  // Enable oxc for all supported languages
  "[javascript]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[javascriptreact]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[typescript]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[typescriptreact]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[vue]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[vue-html]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[html]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[markdown]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[css]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[scss]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[less]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[json]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[jsonc]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[yaml]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[handlebars]": { "editor.defaultFormatter": "oxc.oxc-vscode" },
  "[graphql]": { "editor.defaultFormatter": "oxc.oxc-vscode" }
`

export async function updateVScodeSettings(results: RunResult): Promise<void> {
  if (!results.updateVscodeSettings) return

  const targetDir = path.resolve(results.cwd)
  const dotVscodePath: string = path.join(targetDir, '.vscode')
  const settingsPath: string = path.join(dotVscodePath, 'settings.json')

  const s = p.spinner()
  s.start('Configuring VS Code settings')

  if (!fs.existsSync(dotVscodePath)) {
    await fsp.mkdir(dotVscodePath, { recursive: true })
  }

  const fileExists = fs.existsSync(settingsPath)
  if (!fs.existsSync(settingsPath)) {
    await fsp.writeFile(settingsPath, `{${VSCODE_SETTINGS_STRING}}\n`, 'utf-8')
  } else {
    let settingsContent = await fsp.readFile(settingsPath, 'utf8')

    settingsContent = settingsContent.trim().replace(LAST_LINE_PATTERN, '')
    settingsContent += settingsContent.endsWith(',') || settingsContent.endsWith('{') ? '' : ','
    settingsContent += `${VSCODE_SETTINGS_STRING}}\n`

    await fsp.writeFile(settingsPath, settingsContent, 'utf-8')
  }

  s.stop(fileExists ? 'Updated .vscode/settings.json' : 'Created .vscode/settings.json')
}
