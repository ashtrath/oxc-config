import type { AllowWarnDeny, DummyRule, DummyRuleMap, OxlintConfig, OxlintOverride } from 'oxlint'
import type { PluginSettings as TailwindCSSPluginSettings } from 'oxlint-tailwindcss/config'

/**
 * Map of oxlint rule names to rule configuration or severity levels.
 */
export type Rules = DummyRuleMap & Record<string, DummyRule | undefined>

export interface TypedOxlintOverride extends Omit<OxlintOverride, 'rules'> {
  rules?: Rules
}

export interface TypedOxlintConfig extends Omit<OxlintConfig, 'rules' | 'overrides'> {
  rules?: Rules
  overrides?: TypedOxlintOverride[]
}

/**
 * Single oxlint configuration entry, nested list of entries, or falsy value ignored during merging.
 */
export type OxlintConfigItem =
  | Partial<TypedOxlintConfig>
  | readonly OxlintConfigItem[]
  | null
  | undefined
  | false

/**
 * Options for adjusting linting behavior within editor and IDE environments.
 */
export interface EditorOptions {
  /**
   * Controls whether editor-friendly lint adjustments are enabled.
   *
   * @remarks
   *   Relaxes strict or distracting rules (such as perfectionist sorting and focused tests) while
   *   working inside an IDE or editor. If omitted, automatically detected from common editor
   *   environment variables (VS Code, JetBrains, Vim/Neovim, Zed) when not in CI or git hooks.
   * @default 'auto-detected'
   */
  isInEditor?: boolean
}

/**
 * Options for specifying target file globs for configuration blocks.
 */
export interface FilesOptions {
  /**
   * Glob patterns matching files targeted by this configuration block.
   */
  files?: string[]
}

/**
 * Options for overriding preset rule configurations.
 */
export interface RuleOverridesOptions {
  /**
   * Custom rule severity and option overrides applied on top of preset defaults.
   */
  overrides?: Rules
}

/**
 * Options for specifying target project kinds.
 */
export interface ProjectOptions {
  /**
   * Target project kind.
   *
   * @remarks
   *   Setting to `'lib'` activates stricter lint rules suitable for published libraries, such as
   *   module replacement checks and stricter regex handling.
   * @default 'app'
   */
  type?: 'app' | 'lib'
}

/**
 * Options for configuring TypeScript type-aware lint rules.
 */
export interface TypeAwareOptions {
  /**
   * Enables lint rules that require TypeScript type information.
   *
   * @remarks
   *   Automatically enabled when `oxlint-tsgolint` is detected.
   * @default 'auto-detected'
   * @requires oxlint-tsgolint
   * @see {@link https://oxc.rs/docs/guide/usage/linter/type-aware | Oxlint Type Aware Docs}
   */
  typeAware?: boolean

  /**
   * Glob patterns matching TypeScript files analyzed with type information.
   *
   * @default ['**\/*.{ts,tsx}']
   */
  filesTypeAware?: string[]

  /**
   * Glob patterns matching files excluded from type-aware lint analysis.
   *
   * @default ['**\/_.md\/**', '**\/_.astro/*.ts']
   */
  ignorePatternsTypeAware?: string[]

  /**
   * Custom rule severity and option overrides applied specifically to type-aware rules.
   */
  overridesTypeAware?: Rules
}

/**
 * Options for configuring react-doctor lint rules.
 */
export interface ReactDoctorOptions extends RuleOverridesOptions {
  /**
   * Enables React diagnostic rules.
   *
   * @default false
   * @requires oxlint-plugin-react-doctor
   * @see {@link https://www.react.doctor/docs/rules | React Doctor Rules}
   */
  reactDoctor?: boolean
}

/**
 * Options for core JavaScript lint rules.
 */
export interface JavascriptOptions extends EditorOptions, RuleOverridesOptions {}

/**
 * Options for perfectionist sorting lint rules.
 */
export interface PerfectionistOptions extends EditorOptions, RuleOverridesOptions {}

/**
 * Options for import lint rules.
 */
export interface ImportOptions extends RuleOverridesOptions {}

/**
 * Options for e18e ecosystem performance and modernization lint rules.
 */
export interface E18eOptions extends EditorOptions, ProjectOptions, RuleOverridesOptions {
  /**
   * Enables modern JavaScript syntax and API replacement rules.
   *
   * @default true
   * @see {@link https://github.com/e18e/eslint-plugin#modernization | e18e Modernization Rules}
   */
  modernization?: boolean

  /**
   * Enables dependency replacement rules flagging heavy packages in favor of lighter alternatives.
   *
   * @default type === 'lib' && isInEditor
   * @see {@link https://github.com/e18e/eslint-plugin#module-replacements | e18e Module Replacement Rules}
   */
  moduleReplacements?: boolean

  /**
   * Enables micro-performance checks.
   *
   * @default true
   * @see {@link https://github.com/e18e/eslint-plugin#performance-improvements | e18e Performance Improvement Rules}
   */
  performanceImprovements?: boolean
}

/**
 * Options for unicorn lint rules.
 */
export interface UnicornOptions extends RuleOverridesOptions {}

/**
 * Options for JSX and accessibility lint rules.
 */
export interface JSXOptions {
  /**
   * Enables JSX accessibility rules.
   *
   * @remarks
   *   Accepts a boolean toggle or an options object containing custom rule overrides.
   * @default false
   */
  a11y?: boolean | RuleOverridesOptions
}

/**
 * Options for TypeScript lint rules.
 */
export interface TypescriptOptions
  extends FilesOptions, ProjectOptions, RuleOverridesOptions, TypeAwareOptions {}

/**
 * Options for anti-slop and code clarity lint rules.
 */
export interface AntislopOptions extends RuleOverridesOptions {
  /**
   * Enables anti-slop rules from `@ashtrath/oxlint-plugin-slop`.
   *
   * @default true
   * @requires `@ashtrath/oxlint-plugin-slop`
   */
  slop?: boolean

  /**
   * Enables cognitive complexity and bug detection rules from `sonarjs`.
   *
   * @default true
   */
  sonarjs?: boolean

  /**
   * Maximum cognitive complexity score allowed per function before triggering an error.
   *
   * @remarks
   *   Pass `false` to disable cognitive complexity validation.
   * @default 15
   */
  cognitiveComplexity?: number | false
}

/**
 * Options for regular expression lint rules.
 */
export interface RegexpOptions extends RuleOverridesOptions {
  /**
   * Base severity level applied to regular expression rules.
   */
  severity?: AllowWarnDeny
}

/**
 * Options for Vitest test lint rules.
 */
export interface VitestOptions extends EditorOptions, FilesOptions, RuleOverridesOptions {}

/**
 * Options for React lint rules.
 */
export interface ReactOptions extends FilesOptions, ReactDoctorOptions, RuleOverridesOptions {}

/**
 * Options for Next.js lint rules.
 */
export interface NextJSOptions extends FilesOptions, ReactDoctorOptions, RuleOverridesOptions {}

/**
 * Options for Tailwind CSS lint rules.
 */
export interface TailwindCSSOptions
  extends Omit<TailwindCSSPluginSettings, 'entryPoint'>, RuleOverridesOptions {
  /**
   * CSS entry point used to resolve the Tailwind design system.
   */
  entryPoint: NonNullable<TailwindCSSPluginSettings['entryPoint']>
}
/**
 * Factory configuration options for `ashtrathLint`.
 *
 * @remarks
 *   Provides toggles and sub-options for all built-in lint presets, project environment settings,
 *   and ignore pattern customization.
 */
export interface OxlintFactoryOptions extends EditorOptions, ProjectOptions {
  /**
   * Rule overrides for core JavaScript rules and environments.
   *
   * @remarks
   *   Core JavaScript rules cannot be disabled.
   */
  javascript?: RuleOverridesOptions

  /**
   * Enables Node.js lint rules and globals.
   *
   * @default true
   */
  node?: boolean

  /**
   * Enables or configures perfectionist sorting rules for imports, exports, and object keys.
   *
   * @default true
   */
  perfectionist?: boolean | PerfectionistOptions

  /**
   * Enables JSDoc documentation comment validation rules.
   *
   * @default true
   */
  jsdoc?: boolean

  /**
   * Enables or configures import hygiene and module boundary rules.
   *
   * @default true
   */
  import?: boolean | ImportOptions

  /**
   * Enables or configures e18e ecosystem performance and modernization rules.
   *
   * @default true
   */
  e18e?: boolean | E18eOptions

  /**
   * Enables or configures unicorn rules for idiomatic JavaScript and Node.js code.
   *
   * @default true
   */
  unicorn?: boolean | UnicornOptions

  /**
   * Enables or configures JSX accessibility rules.
   *
   * @default true
   */
  jsx?: boolean | JSXOptions

  /**
   * Enables or configures TypeScript lint rules and optional type-aware checks.
   *
   * @remarks
   *   Automatically enabled when `typescript` or `@typescript/native-preview` is detected.
   * @default 'auto-detected'
   * @requires `typescript`
   * @requires `@typescript/native-preview`
   */
  typescript?: boolean | TypescriptOptions

  /**
   * Enables or configures anti-slop rules from `@ashtrath/oxlint-plugin-slop`.
   *
   * @default false
   * @requires `@ashtrath/oxlint-plugin-slop`
   */
  antislop?: boolean | AntislopOptions

  /**
   * Enables or configures regular expression lint rules.
   *
   * @default true
   */
  regexp?: boolean | RegexpOptions

  /**
   * Enables or configures Vitest testing rules and test file overrides.
   *
   * @default true
   */
  vitest?: boolean | VitestOptions

  /**
   * Enables or configures React and React Hooks lint rules.
   *
   * @remarks
   *   Automatically enabled when `react` is detected.
   * @default 'auto-detected'
   */
  react?: boolean | ReactOptions

  /**
   * Enables or configures Next.js rules and core web vitals checks.
   *
   * @remarks
   *   Automatically enabled when `next` is detected.
   * @default 'auto-detected'
   */
  nextjs?: boolean | NextJSOptions

  /**
   * Enables or configures Tailwind CSS utility class linting.
   *
   * @default false
   */
  tailwindcss?: false | TailwindCSSOptions

  /**
   * File patterns to ignore during linting. Patterns are matched relative to the directory
   * containing `oxlint.config.ts`.
   *
   * @remarks
   *   - Passing an array extends the default ignores.
   *   - Passing a function allows modifying the default ignores.
   *
   * @default [ ]
   */
  ignorePatterns?: string[] | ((defaults: string[]) => string[])
}
