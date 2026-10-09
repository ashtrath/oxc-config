import type { OxlintConfig } from 'oxlint'

export interface HasEditorContext {
  /**
   * Control to disable some rules in editors.
   *
   * @default auto-detect based on the process.env
   */
  isInEditor?: boolean
}

export interface HasFilesOption {
  files?: string[]
}

export interface HasRuleOverrides {
  overrides?: OxlintConfig['rules']
}

export interface HasProjectContext {
  /**
   * Type of the project. `lib` will enable more strict rules for libraries.
   *
   * @default 'app'
   */
  type?: 'app' | 'lib'
}

export interface HasTypeAwareOptions {
  /**
   * Enable rules that require TypeScript type information. Corresponds to the Oxlint `--type-aware`
   * flag.
   *
   * Requires `oxlint-tsgolint` to be installed.
   *
   * @default false
   * @see https://oxc.rs/docs/guide/usage/linter/type-aware
   */
  typeAware?: boolean

  /**
   * Glob patterns for files that should be type aware.
   *
   * @default ['**\/*.{ts,tsx}']
   */
  filesTypeAware?: string[]

  /**
   * Glob patterns for files that should not be type aware.
   *
   * @default ['**\/_.md\/**', '**\/_.astro/*.ts']
   */
  ignorePatternsTypeAware?: string[]

  /**
   * Override type aware rules.
   */
  overridesTypeAware?: OxlintConfig['rules']
}

export interface HasReactDoctorOptions extends HasRuleOverrides {
  /**
   * Enable react-doctor rules.
   *
   * Requires `oxlint-plugin-react-doctor` to be installed.
   *
   * @default auto-detected
   * @see https://www.react.doctor/docs/rules
   */
  reactDoctor?: boolean
}

export interface JavascriptOptions extends HasEditorContext, HasFilesOption, HasRuleOverrides {}

export interface PerfectionistOptions extends HasEditorContext, HasRuleOverrides {}

export interface ImportOptions extends HasRuleOverrides {}

export interface E18eOptions extends HasEditorContext, HasProjectContext, HasRuleOverrides {
  /**
   * Include modern syntax and API replacement rules via @e18e/eslint-plugin in jsPlugins.
   *
   * @default true
   */
  modernization?: boolean

  /**
   * Include module replacements rules
   *
   * @default type === 'lib' && isInEditor
   * @see https://github.com/e18e/eslint-plugin#module-replacements
   */
  moduleReplacements?: boolean

  /**
   * Include micro-performance checks via @e18e/eslint-plugin in jsPlugins.
   *
   * @default true
   */
  performanceImprovements?: boolean
}

export interface UnicornOptions extends HasRuleOverrides {}

export interface JSXOptions {
  /**
   * Enable JSX accessibility rules via the built-in jsx-a11y plugin.
   *
   * Can be a boolean or an object for custom options and overrides.
   *
   * @default false
   */
  a11y?: boolean | HasRuleOverrides
}

export interface TypescriptOptions
  extends HasFilesOption, HasProjectContext, HasRuleOverrides, HasTypeAwareOptions {}

export interface AntislopOptions extends HasRuleOverrides {
  /**
   * Enable anti-slop rules via @ashtrath/oxlint-plugin-slop in jsPlugins.
   *
   * @default true
   */
  slop?: boolean

  /**
   * Enable cognitive complexity and bug detection rules from sonarjs in jsPlugins.
   *
   * @default true
   */
  sonarjs?: boolean

  /**
   * Threshold for cognitive complexity checks. Pass `false` to disable.
   *
   * @default 15
   */
  cognitiveComplexity?: number | false
}

export interface RegexpOptions extends HasRuleOverrides {
  /**
   * Override rulelevels
   */
  level?: 'error' | 'warn'
}

export interface VitestOptions extends HasEditorContext, HasFilesOption, HasRuleOverrides {}

export interface ReactOptions extends HasFilesOption, HasReactDoctorOptions, HasRuleOverrides {}

export interface NextJSOptions extends HasFilesOption, HasReactDoctorOptions, HasRuleOverrides {}

export interface TailwindCSSOptions extends HasRuleOverrides {}

export interface FactoryOptions extends HasEditorContext, HasProjectContext {
  /**
   * Core JavaScript lint rules. Can't be disabled
   */
  javascript?: HasRuleOverrides

  /**
   * Enable Node.js lint rules.
   *
   * @default true
   */
  node?: boolean

  /**
   * Perfectionist lint rules.
   *
   * @default true
   */
  perfectionist?: boolean | PerfectionistOptions

  /**
   * Enable JSDoc lint rules.
   *
   * @default true
   */
  jsdoc?: boolean

  /**
   * Import lint rules.
   *
   * @default true
   */
  import?: boolean | ImportOptions

  /**
   * Ecosystem performance and modernization rules via Oxlint jsPlugins.
   *
   * @default true
   */
  e18e?: boolean | E18eOptions

  /**
   * Unicorn lint rules.
   *
   * @default true
   */
  unicorn?: boolean | UnicornOptions

  /**
   * JSX and JSX-A11y lint rules.
   *
   * @default true
   */
  jsx?: boolean | JSXOptions

  /**
   * TypeScript lint rules.
   *
   * @default auto-detected
   */
  typescript?: boolean | TypescriptOptions

  /**
   * Anti-slop lint rules.
   *
   * @default false
   */
  antislop?: boolean | AntislopOptions

  /**
   * Regular expression lint rules.
   *
   * @default true
   */
  regexp?: boolean | RegexpOptions

  /**
   * Vitest lint rules.
   *
   * @default true
   */
  vitest?: boolean | VitestOptions

  /**
   * React lint rules.
   *
   * @default false
   */
  react?: boolean | ReactOptions

  /**
   * Next.js lint rules.
   *
   * @default false
   */
  nextjs?: boolean | NextJSOptions

  /**
   * TailwindCSS lint rules.
   *
   * @default false
   */
  tailwindcss?: boolean | TailwindCSSOptions

  /**
   * File patterns to ignore during linting. Patterns are matched relative to the directory
   * containing oxlint.config.ts.
   *
   * - Passing an array extends the default ignores.
   * - Passing a function allows modifying the default ignores.
   *
   * @default [ ]
   */
  ignorePatterns?: string[] | ((defaults: string[]) => string[])
}
