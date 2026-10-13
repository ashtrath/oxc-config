import type { ESTree, SourceCode } from '@oxlint/plugins'

import type { TypeAssertionExpression } from '../lib/ast'

import { defineRule } from '@oxlint/plugins'

import { getNodeParent, isConstAssertion } from '../lib/ast'

const DEFAULT_SAFETY_MARKERS = ['SAFETY', 'INVARIANT'] as const

const COMMENT_OWNER_KINDS: Record<string, true> = {
  DoWhileStatement: true,
  ExportDefaultDeclaration: true,
  ExpressionStatement: true,
  ForInStatement: true,
  ForOfStatement: true,
  ForStatement: true,
  FunctionDeclaration: true,
  IfStatement: true,
  PropertyDefinition: true,
  ReturnStatement: true,
  SwitchStatement: true,
  ThrowStatement: true,
  VariableDeclaration: true,
  WhileStatement: true,
}

function configuredSafetyMarkers(option: unknown): readonly string[] {
  if (!option || typeof option !== 'object' || !('markers' in option)) {
    return DEFAULT_SAFETY_MARKERS
  }

  const configured = option.markers
  if (!Array.isArray(configured)) return DEFAULT_SAFETY_MARKERS

  const markers = configured.flatMap(marker =>
    typeof marker === 'string' && marker.trim().length > 0 ? [marker.trim()] : [],
  )
  return markers.length > 0 ? markers : DEFAULT_SAFETY_MARKERS
}

function markerPattern(markers: readonly string[]): RegExp {
  const alternation = markers
    .map(marker => marker.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`))
    .join('|')
  return new RegExp(String.raw`(?:^|[^\p{L}\p{N}_])(?:${alternation})\s*:\s*\S`, 'u')
}

function hasSafetyJustificationBefore(
  sourceCode: SourceCode,
  owner: ESTree.Node,
  assertion: TypeAssertionExpression,
  pattern: RegExp,
): boolean {
  const assertionStart = assertion.range ? assertion.range[0] : (assertion.start ?? 0)
  return sourceCode.getCommentsBefore(owner).some(comment => {
    const commentEnd = comment.range ? comment.range[1] : (comment.end ?? 0)
    return commentEnd <= assertionStart && pattern.test(comment.value)
  })
}

function hasSafetyComment(
  sourceCode: SourceCode,
  node: TypeAssertionExpression,
  pattern: RegExp,
): boolean {
  let current: ESTree.Node = node
  while (true) {
    if (hasSafetyJustificationBefore(sourceCode, current, node, pattern)) {
      return true
    }

    if (current.type in COMMENT_OWNER_KINDS) {
      const exportDeclaration = getNodeParent(current)
      return (
        exportDeclaration !== null &&
        exportDeclaration.type === 'ExportNamedDeclaration' &&
        exportDeclaration.declaration === current &&
        hasSafetyJustificationBefore(sourceCode, exportDeclaration, node, pattern)
      )
    }

    const parent = getNodeParent(current)
    if (!parent || parent.type === 'Program') {
      return false
    }

    current = parent
  }
}

/**
 * Configuration options for {@link requireSafetyCommentForTypeAssertion}.
 */
export interface RequireSafetyCommentForTypeAssertionOptions {
  /**
   * Uppercase comment markers that justify type assertions.
   *
   * @defaultValue ['SAFETY', 'INVARIANT']
   */
  markers?: string[]
}

/**
 * Requires an explanatory safety comment for every non-const TypeScript type assertion.
 *
 * @remarks
 *   Type assertions (`as Type` and `<Type>`) bypass static type checking. Every assertion must have
 *   an adjacent preceding comment beginning with an accepted marker (such as `// SAFETY:` or `//
 *   INVARIANT:`). Const assertions (`as const`) are exempt.
 * @example
 *   // Incorrect
 *   const id = value as UserId
 *
 *   // Correct
 *   // SAFETY: The parser verified the id format.
 *   const id = value as UserId
 *   const values = [1, 2] as const
 */
export const requireSafetyCommentForTypeAssertion = defineRule({
  meta: {
    type: 'problem',
    defaultOptions: [{ markers: ['SAFETY', 'INVARIANT'] }],
    docs: {
      description:
        'Require a nearby SAFETY or INVARIANT comment for every TypeScript type assertion except const assertions.',
    },
    messages: {
      missingSafetyComment:
        'This type assertion has no `{{marker}}:` justification. State the checked invariant immediately before the assertion or its containing statement.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          markers: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
            minItems: 1,
            uniqueItems: true,
          },
        },
      },
    ],
  },
  createOnce(context) {
    const patterns = new Map<string, RegExp>()

    const checkAssertion = (node: TypeAssertionExpression): void => {
      if (isConstAssertion(node)) return

      const markers = configuredSafetyMarkers(context.options?.[0])
      const patternKey = markers.join('\u0000')
      let pattern = patterns.get(patternKey)
      if (!pattern) {
        pattern = markerPattern(markers)
        patterns.set(patternKey, pattern)
      }

      if (hasSafetyComment(context.sourceCode, node, pattern)) return

      context.report({
        data: { marker: markers[0] ?? DEFAULT_SAFETY_MARKERS[0] },
        messageId: 'missingSafetyComment',
        node,
      })
    }

    return {
      TSAsExpression: checkAssertion,
      TSTypeAssertion: checkAssertion,
    }
  },
})
