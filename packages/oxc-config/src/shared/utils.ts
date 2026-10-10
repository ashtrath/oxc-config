import { isPackageExists } from 'local-pkg'
import { fileURLToPath } from 'node:url'

import { GLOB_EXCLUDE, GLOB_TS, GLOB_TSX } from './globs'

const scopeDir = fileURLToPath(new URL('.', import.meta.url))
const isConfigInstalled = isPackageExists('@ashtrath/oxc-config')

export function isPackageInScope(name: string): boolean {
  return isPackageExists(name, { paths: [scopeDir, process.cwd()] })
}

const promptedPackages = new Set<string>()
export async function ensurePackages(packages: (string | false | undefined)[]): Promise<void> {
  if (process.env.CI || !process.stdout.isTTY || !isConfigInstalled) return

  const missingPackages = packages.filter((pkg): pkg is string =>
    Boolean(pkg && !isPackageInScope(pkg) && !promptedPackages.has(pkg)),
  )

  if (missingPackages.length === 0) return

  for (const pkg of missingPackages) {
    promptedPackages.add(pkg)
  }

  const prompts = await import('@clack/prompts')
  const count = missingPackages.length
  const list = missingPackages.join('\n')

  prompts.note(list, `Missing ${count} ${count === 1 ? 'dependency' : 'dependencies'}:`, {
    format: (line: string) => `- ${line}`,
  })
  const shouldInstall = await prompts.confirm({
    message: `Install ${count === 1 ? 'it' : 'them'} now?`,
  })

  if (prompts.isCancel(shouldInstall) || !shouldInstall) return

  const { installPackage } = await import('@antfu/install-pkg')
  await installPackage(missingPackages, { dev: true })
}

export function resolvePlugin(name: string): string {
  try {
    return fileURLToPath(import.meta.resolve(name))
  } catch {
    throw new Error(`[@ashtrath/oxc-config] Package '${name}' is required but not installed.`)
  }
}

export function isInGitHooksOrLintStaged(): boolean {
  return !!(
    process.env.GIT_PARAMS ||
    process.env.VSCODE_GIT_COMMAND ||
    process.env.npm_lifecycle_script?.startsWith('lint-staged')
  )
}

export function isInEditorEnv(): boolean {
  if (process.env.CI) return false
  if (isInGitHooksOrLintStaged()) return false

  return !!(
    process.env.VSCODE_PID ||
    process.env.VSCODE_CWD ||
    process.env.JETBRAINS_IDE ||
    process.env.VIM ||
    process.env.NVIM ||
    (process.env.ZED_ENVIRONMENT && !process.env.ZED_TERM)
  )
}

export function resolveIgnorePatterns(
  userIgnores: string[] | ((originals: string[]) => string[]) = [],
  ignoreTypeScript = false,
): string[] {
  let ignorePatterns = [...GLOB_EXCLUDE]
  if (ignoreTypeScript) ignorePatterns.push(GLOB_TS, GLOB_TSX)

  if (typeof userIgnores === 'function') {
    ignorePatterns = userIgnores(ignorePatterns)
  } else {
    ignorePatterns = [...ignorePatterns, ...userIgnores]
  }

  return ignorePatterns
}
