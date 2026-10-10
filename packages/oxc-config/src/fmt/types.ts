import type {
  JsdocConfig,
  OxfmtConfig,
  SortImportsConfig,
  SortPackageJsonConfig,
  SortTailwindcssConfig,
} from 'oxfmt'

import type { OmitIndexSignature, Simplify } from '../shared/types'

/**
 * Options for configuring oxfmt via `ashtrathFmt`.
 *
 * @remarks
 *   Provides toggles and sub-options for all built-in formatters presets and ignore pattern
 *   customization.
 */
export type OxfmtFactoryOptions = Simplify<
  Omit<OmitIndexSignature<OxfmtConfig>, 'overrides'> & {
    /**
     * Enables or configures import sorting based on perfectionist group semantics.
     *
     * @remarks
     *   Passing `true` enables grouped ascending order: type imports first, builtins and
     *   third-party packages, internal path aliases (`~/`, `@/`, `#`), relative paths, side
     *   effects, and style imports. Passing `false` disables import reordering.
     * @default true
     */
    sortImports?: boolean | SortImportsConfig

    /**
     * Enables or configures Tailwind CSS utility class sorting.
     *
     * @remarks
     *   Sorts class attributes and utility calls in helper functions (`clsx`, `cn`, `cva`, `tw`).
     *   Auto-detected based on whether `tailwindcss` is installed in project dependencies.
     * @default auto-detected
     */
    sortTailwindcss?: boolean | SortTailwindcssConfig

    /**
     * Enables or configures package.json field and scripts sorting.
     *
     * @remarks
     *   Passing `true` orders top-level manifest keys according to npm package conventions and
     *   sorts the `scripts` object alphabetically.
     * @default true
     */
    sortPackageJson?: boolean | SortPackageJsonConfig

    /**
     * Enables or configures JSDoc and TSDoc comment formatting and normalization.
     *
     * @remarks
     *   Passing `true` applies multiline comment alignment and formats markdown fences within
     *   documentation comments.
     * @default true
     */
    jsdoc?: boolean | JsdocConfig

    /**
     * File patterns to ignore during formatting. Patterns are matched relative to the directory
     * containing oxfmt.config.ts.
     *
     * @remarks
     *   Defaults exclude node_modules, lockfiles, build outputs, generated files, and TypeScript
     *   sources when TypeScript is not detected. Passing an array extends the default ignores;
     *   passing a callback receives defaults and returns the customized list.
     * @default [ ]
     */
    ignorePatterns?: string[] | ((defaults: string[]) => string[])
  }
>
