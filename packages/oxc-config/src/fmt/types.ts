import type {
  JsdocConfig,
  Oxfmtrc,
  SortImportsConfig,
  SortPackageJsonConfig,
  SortTailwindcssConfig,
  SvelteConfig,
} from 'oxfmt'

import type { OmitIndexSignature, Simplify } from '../shared/types'

export type OxfmtFactoryOptions = Simplify<
  Omit<OmitIndexSignature<Oxfmtrc>, 'overrides'> & {
    /**
     * File patterns to ignore during formatting. Patterns are matched relative to the directory
     * containing oxfmt.config.ts.
     *
     * - Passing an array extends the default ignores.
     * - Passing a function allows modifying the default ignores.
     *
     * @default [ ]
     */
    ignorePatterns?: string[] | ((defaults: string[]) => string[])

    /**
     * Native Rust import sorting based on perfectionist group semantics. Passing `true` enables
     * opinionated import group order.
     *
     * @default true
     */
    sortImports?: boolean | SortImportsConfig

    /**
     * Native Rust Tailwind CSS utility class sorting. Passing `true` enables sorting for clsx, cn,
     * cva, and tw functions.
     *
     * @default auto-detected
     */
    sortTailwindcss?: boolean | SortTailwindcssConfig

    /**
     * Native Rust package.json sorting. Passing `true` enables sorting package.json
     *
     * @default true
     */
    sortPackageJson?: boolean | SortPackageJsonConfig

    /**
     * JSDoc comment reformatting and normalization. Passing `true` enables multiline strategy, tag
     * alignment, and capitalization.
     *
     * @default true
     */
    jsdoc?: boolean | JsdocConfig

    /**
     * Svelte file formatting via prettier-plugin-svelte. Requires `svelte` to be installed in the
     * project.
     *
     * @default auto-detected
     */
    svelte?: boolean | SvelteConfig
  }
>
