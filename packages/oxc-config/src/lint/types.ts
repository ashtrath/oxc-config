import type { AllowWarnDeny, DummyRule, DummyRuleMap, OxlintConfig } from 'oxlint'

export type Rules = DummyRuleMap & Record<string, DummyRule | undefined>

export type OxlintConfigItem =
  | Partial<OxlintConfig>
  | readonly OxlintConfigItem[]
  | null
  | undefined
  | false

export interface EditorOptions {
  /**
   * Disables or adjusts editor-unfriendly rules when running inside an IDE or editor context.
   *
   * If omitted, this is automatically detected by checking common editor environment variables (VS
   * Code, JetBrains, Vim, Zed) and ensuring it is not running in CI.
   *
   * @default 'auto-detected'
   */
  isInEditor?: boolean
}

export interface FilesOptions {
  /**
   * File glob patterns to include for this configuration block.
   */
  files?: string[]
}

export interface RuleOverridesOptions {
  /**
   * Rule overrides applied on top of the preset defaults.
   */
  overrides?: Rules
}

export interface ProjectOptions {
  /**
   * Type of the project. `lib` will enable more strict rules for libraries.
   *
   * @default 'app'
   */
  type?: 'app' | 'lib'
}

export interface TypeAwareOptions {
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
  overridesTypeAware?: Rules
}

export interface ReactDoctorOptions extends RuleOverridesOptions {
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

export interface JavascriptOptions extends EditorOptions, RuleOverridesOptions {}

export interface PerfectionistOptions extends EditorOptions, RuleOverridesOptions {}

export interface ImportOptions extends RuleOverridesOptions {}

export interface E18eOptions extends EditorOptions, ProjectOptions, RuleOverridesOptions {
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

export interface UnicornOptions extends RuleOverridesOptions {}

export interface JSXOptions {
  /**
   * Enable JSX accessibility rules via the built-in jsx-a11y plugin.
   *
   * Can be a boolean or an object for custom options and overrides.
   *
   * @default false
   */
  a11y?: boolean | RuleOverridesOptions
}

export interface TypescriptOptions
  extends FilesOptions, ProjectOptions, RuleOverridesOptions, TypeAwareOptions {}

export interface AntislopOptions extends RuleOverridesOptions {
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

export interface RegexpOptions extends RuleOverridesOptions {
  /**
   * Override rule severity
   */
  severity?: AllowWarnDeny
}

export interface VitestOptions extends EditorOptions, FilesOptions, RuleOverridesOptions {}

export interface ReactOptions extends FilesOptions, ReactDoctorOptions, RuleOverridesOptions {}

export interface NextJSOptions extends FilesOptions, ReactDoctorOptions, RuleOverridesOptions {}

export interface TailwindCSSOptions extends RuleOverridesOptions {}

export interface FactoryOptions extends EditorOptions, ProjectOptions {
  /**
   * Core JavaScript lint rules. Can't be disabled
   */
  javascript?: RuleOverridesOptions

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
   * @default auto-detected
   */
  react?: boolean | ReactOptions

  /**
   * Next.js lint rules.
   *
   * @default auto-detected
   */
  nextjs?: boolean | NextJSOptions

  /**
   * TailwindCSS lint rules.
   *
   * @default auto-detected
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
