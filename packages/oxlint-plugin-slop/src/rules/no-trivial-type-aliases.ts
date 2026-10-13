import type { ESTree } from '@oxlint/plugins'

import { defineRule } from '@oxlint/plugins'

type Alias = ESTree.TSTypeAliasDeclaration
type Terminal = 'primitive' | 'unknown'

const DEFAULT_ALLOW_PRIMITIVES = true

const PRIMITIVE_TYPES: ReadonlySet<string> = new Set([
  'TSBigIntKeyword',
  'TSBooleanKeyword',
  'TSNullKeyword',
  'TSNumberKeyword',
  'TSStringKeyword',
  'TSSymbolKeyword',
  'TSUndefinedKeyword',
])

function collectAliases(program: ESTree.Program): Map<string, Alias> {
  const aliases = new Map<string, Alias>()

  for (const statement of program.body) {
    const declaration =
      statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement
    if (declaration?.type === 'TSTypeAliasDeclaration') {
      aliases.set(declaration.id.name, declaration)
    }
  }

  return aliases
}

function resolveTerminal(start: Alias, aliases: ReadonlyMap<string, Alias>): Terminal | null {
  const seen = new Set<Alias>()

  for (let alias: Alias | undefined = start; alias && !seen.has(alias);) {
    seen.add(alias)
    if (alias.typeParameters?.params.length) return null

    const annotation = alias.typeAnnotation
    if (annotation.type === 'TSUnknownKeyword') return 'unknown'
    if (PRIMITIVE_TYPES.has(annotation.type)) return 'primitive'
    if (
      annotation.type !== 'TSTypeReference' ||
      annotation.typeName.type !== 'Identifier' ||
      annotation.typeArguments
    ) {
      return null
    }

    alias = aliases.get(annotation.typeName.name)
  }

  return null
}

/**
 * Configuration options for {@link noTrivialTypeAliases}.
 */
export interface NoTrivialTypeAliasesOptions {
  /**
   * Whether to allow aliases that resolve to bare primitive types (`string`, `number`, etc.).
   *
   * @defaultValue true
   */
  allowPrimitives?: boolean
}

/**
 * Disallows top-level type aliases that resolve only to `unknown` or bare primitives.
 *
 * @remarks
 *   Aliasing `unknown` obscures unvalidated input without providing type evidence. When
 *   `allowPrimitives` is set to `false`, aliases to bare primitives without nominal branding or
 *   constraints are also flagged.
 * @example
 *   // Incorrect
 *   type Unchecked = unknown
 *   type UserId = string // when { allowPrimitives: false }
 *
 *   // Correct
 *   type UserId = string // allowed by default
 *   type BrandedId = string & { readonly __brand: unique symbol }
 */
export const noTrivialTypeAliases = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow type aliases that resolve only to a primitive or unknown.',
    },
    messages: {
      primitive:
        'This alias adds no structure to its primitive type. Use the primitive directly, or add a real constraint or brand.',
      unknown:
        'This alias hides missing type evidence. Keep unknown visible at the boundary, then parse or narrow it before use.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowPrimitives: {
            type: 'boolean',
            default: DEFAULT_ALLOW_PRIMITIVES,
          },
        },
      },
    ],
  },
  createOnce(context) {
    let allowPrimitives = DEFAULT_ALLOW_PRIMITIVES

    return {
      before() {
        const options = context.options[0] as NoTrivialTypeAliasesOptions | undefined
        allowPrimitives = options?.allowPrimitives ?? DEFAULT_ALLOW_PRIMITIVES

        const text = context.sourceCode.text
        return allowPrimitives ? text.includes('unknown') : text.includes('type')
      },

      Program(node) {
        const aliases = collectAliases(node)

        for (const alias of aliases.values()) {
          const terminal = resolveTerminal(alias, aliases)
          if (terminal === null || (terminal === 'primitive' && allowPrimitives)) continue

          context.report({
            messageId: terminal,
            node: alias,
          })
        }
      },
    }
  },
})
