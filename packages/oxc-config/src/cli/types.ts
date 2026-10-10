export type FrameworkOption = 'react' | 'nextjs'
export type ExtraLibrariesOption = 'tailwindcss'

export interface RunOptions {
  cwd?: string
  frameworks?: FrameworkOption[]
  extra?: ExtraLibrariesOption[]
}

export interface RunResult {
  cwd: string
  uncommittedConfirmed: boolean
  frameworks: FrameworkOption[]
  extra: ExtraLibrariesOption[]
  updateVscodeSettings: unknown
}
