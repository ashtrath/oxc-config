import { GLOB_EXCLUDE, GLOB_TS, GLOB_TSX } from './globs'

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
) {
  let ignorePatterns = [...GLOB_EXCLUDE]
  if (ignoreTypeScript) ignorePatterns.push(GLOB_TS, GLOB_TSX)

  if (typeof userIgnores === 'function') {
    ignorePatterns = userIgnores(ignorePatterns)
  } else {
    ignorePatterns = [...ignorePatterns, ...userIgnores]
  }

  return ignorePatterns
}
