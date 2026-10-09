import type { OxfmtOverrideConfig } from 'oxfmt'

import type { OxfmtFactoryOptions } from './types'

import { isPackageExists } from 'local-pkg'
import { defineConfig } from 'oxfmt'

import { resolveIgnorePatterns } from '../shared/utils'

export function ashtrathFmt(
  options: OxfmtFactoryOptions = {},
  ...userOverrides: OxfmtOverrideConfig[]
) {
  const {
    sortImports = true,
    sortPackageJson = true,
    sortTailwindcss = isPackageExists('tailwindcss'),
    jsdoc = true,
    ignorePatterns: userIgnorePatterns = [],
    ...directOptions
  } = options

  const hasTypescript =
    isPackageExists('typescript') || isPackageExists('@typescript/native-preview')

  return defineConfig({
    // Base config
    arrowParens: 'avoid',
    bracketSameLine: false,
    bracketSpacing: true,
    endOfLine: 'lf',
    insertFinalNewline: true,
    jsxSingleQuote: false,
    printWidth: 100,
    quoteProps: 'as-needed',
    semi: false,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
    useTabs: false,

    ...directOptions,

    sortImports: resolveOptions(sortImports, {
      internalPattern: ['~/', '@/', '#'],
      order: 'asc',
      partitionByComment: false,
      partitionByNewline: false,
      groups: [
        'type-import',
        ['type-parent', 'type-sibling', 'type-index', 'type-internal'],
        { newlinesBetween: true },
        ['value-builtin', 'value-external'],
        'value-internal',
        ['value-parent', 'value-sibling', 'value-index'],
        'side_effect',
        'style',
        'unknown',
      ],
    }),

    sortPackageJson,

    sortTailwindcss: resolveOptions(sortTailwindcss, {
      functions: ['clsx', 'cn', 'cva', 'tw'],
    }),

    jsdoc: resolveOptions(jsdoc, {
      commentLineStrategy: 'multiline',
      preferCodeFences: true,
    }),

    ignorePatterns: resolveIgnorePatterns(userIgnorePatterns, !hasTypescript),
    overrides: [...userOverrides],
  })
}

function resolveOptions<T>(value: boolean | T, defaults: T): false | T {
  if (value === false) return false
  return value === true ? defaults : value
}
