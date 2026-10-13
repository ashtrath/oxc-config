import type { ESTree } from '@oxlint/plugins'

import type { TypeAssertionExpression } from '../lib/ast'

import { defineRule } from '@oxlint/plugins'

import {
  getNodeParent,
  isConstAssertion,
  isTypeAssertion,
  unwrapParenthesizedExpression,
} from '../lib/ast'

function isOutermostAssertion(node: TypeAssertionExpression): boolean {
  let current: ESTree.Expression = node
  let parent = getNodeParent(node)

  while (parent?.type === 'ParenthesizedExpression' && parent.expression === current) {
    current = parent
    parent = getNodeParent(parent)
  }

  return !parent || !isTypeAssertion(parent) || parent.expression !== current
}

function isForbiddenAssertionChain(node: TypeAssertionExpression): boolean {
  let current: TypeAssertionExpression = node
  let hasNonConst = !isConstAssertion(node)
  let chained = false

  while (true) {
    const next = unwrapParenthesizedExpression(current.expression)
    if (!isTypeAssertion(next)) break

    chained = true
    if (!isConstAssertion(next)) {
      hasNonConst = true
    }
    current = next
  }

  return chained && hasNonConst
}

/**
 * Disallows chained TypeScript type assertions (`as` and `<Type>`), including parenthesized chains.
 *
 * @remarks
 *   Assertion chains such as `x as unknown as T` or `<T><unknown>x` bypass type safety and discard
 *   static type evidence. Chains comprised exclusively of const assertions (`as const`) are
 *   permitted. Parse or validate untrusted values at module boundaries instead of forcing chained
 *   casts.
 * @example
 *   // Incorrect
 *   const value = input as unknown as User
 *   const value = input as unknown as string
 *
 *   // Correct
 *   const value = input as User
 *   const value = { id: 1 } as const
 */
export const noChainedTypeAssertions = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow chained TypeScript as and angle-bracket assertions, including parenthesized chains.',
    },
    messages: {
      chained:
        'This assertion chain discards type evidence. Keep the original precise type, or parse untrusted input at its boundary before narrowing it.',
    },
  },
  createOnce(context) {
    const checkTypeAssertion = (node: TypeAssertionExpression): void => {
      if (!isOutermostAssertion(node)) return
      if (!isForbiddenAssertionChain(node)) return

      context.report({ messageId: 'chained', node })
    }

    return {
      TSAsExpression: checkTypeAssertion,
      TSTypeAssertion: checkTypeAssertion,
    }
  },
})
