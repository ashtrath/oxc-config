import type { ESTree } from '@oxlint/plugins'

import { defineRule } from '@oxlint/plugins'

import { unwrapParenthesizedExpression } from '../lib/ast'

function isEmptyObject(node: ESTree.Expression): boolean {
  const unwrapped = unwrapParenthesizedExpression(node)
  return unwrapped.type === 'ObjectExpression' && unwrapped.properties.length === 0
}

function hasEmptyObjectBranch(node: ESTree.Expression): boolean {
  const unwrapped = unwrapParenthesizedExpression(node)
  return (
    unwrapped.type === 'ConditionalExpression' &&
    (isEmptyObject(unwrapped.consequent) || isEmptyObject(unwrapped.alternate))
  )
}

/**
 * Disallows object spreads that conditionally spread an empty object to omit fields.
 *
 * @example
 *   // Incorrect
 *   const obj = { ...(condition ? { key: value } : {}) }
 *
 *   // Correct
 *   const obj: Record<string, string> = {}
 *   if (condition) {
 *     obj.key = value
 *   }
 */
export const noConditionalEmptyObjectSpread = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow object spreads that conditionally spread an empty object to omit fields.',
    },
    messages: {
      avoid:
        'This conditional spread hides property omission behind an empty object. Build the object in separate statements and add the property only when present.',
    },
  },
  createOnce(context) {
    return {
      ObjectExpression(node) {
        for (const prop of node.properties) {
          if (prop.type === 'SpreadElement' && hasEmptyObjectBranch(prop.argument)) {
            context.report({ messageId: 'avoid', node: prop })
          }
        }
      },
    }
  },
})
