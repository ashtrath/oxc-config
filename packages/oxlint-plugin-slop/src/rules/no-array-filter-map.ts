import type { ESTree } from '@oxlint/plugins'

import { defineRule } from '@oxlint/plugins'

import { isKnownArrayExpression } from '../lib/array'
import { getStaticMemberTarget, unwrapExpression } from '../lib/ast'

function isBooleanFilter(call: ESTree.CallExpression): boolean {
  const argument = call.arguments[0]
  if (argument === undefined) return false

  const unwrapped = unwrapExpression(argument)
  return unwrapped.type === 'Identifier' && unwrapped.name === 'Boolean'
}

/**
 * Configuration options for {@link noArrayFilterMap}.
 */
export interface NoArrayFilterMapOptions {
  /**
   * Whether to ignore consecutive passes when `.filter(Boolean)` is used.
   *
   * @defaultValue false
   */
  ignoreBooleanFilter?: boolean
}

/**
 * Disallows consecutive array `filter` and `map` passes in favor of lazy iterator helpers, a single
 * `flatMap`, or a loop.
 *
 * @remarks
 *   Chaining `.filter().map()` or `.map().filter()` allocates an intermediate array for the first
 *   pass. Use `.values().filter(...).map(...).toArray()` where iterator helpers are supported,
 *   `flatMap`, or a single loop.
 * @example
 *   // Incorrect
 *   const activeEmails = users.filter(user => user.active).map(user => user.email)
 *
 *   // Correct
 *   const activeEmails = users.flatMap(user => (user.active ? [user.email] : []))
 */
export const noArrayFilterMap = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow adjacent array filter/map passes in favor of lazy iterator helpers or a single transformation.',
    },
    messages: {
      arrayFilterMap:
        'Avoid consecutive array `{{first}}` and `{{second}}` passes. Prefer `.values().{{first}}(...).{{second}}(...).toArray()` where iterator helpers are supported, a single loop pass, or `flatMap`. Preserve callback ordering, indexes, and filtering semantics.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          ignoreBooleanFilter: {
            type: 'boolean',
            default: false,
          },
        },
      },
    ],
  },
  createOnce(context) {
    let ignoreBooleanFilter = false

    return {
      before() {
        const text = context.sourceCode.text
        if (!text.includes('filter') || !text.includes('map')) return false

        const options = context.options[0] as NoArrayFilterMapOptions | undefined
        ignoreBooleanFilter = options?.ignoreBooleanFilter ?? false
        return true
      },

      CallExpression(node) {
        const outer = getStaticMemberTarget(node.callee)
        if (outer === null || (outer.name !== 'map' && outer.name !== 'filter')) return

        const innerCall = unwrapExpression(outer.object)
        if (innerCall.type !== 'CallExpression') return

        const inner = getStaticMemberTarget(innerCall.callee)
        if (inner === null || inner.name !== (outer.name === 'map' ? 'filter' : 'map')) return

        if (ignoreBooleanFilter && isBooleanFilter(outer.name === 'filter' ? node : innerCall)) {
          return
        }

        if (!isKnownArrayExpression(context.sourceCode, inner.object)) return

        const { sourceCode } = context
        context.report({
          data: { first: inner.name, second: outer.name },
          messageId: 'arrayFilterMap',
          loc: {
            end: sourceCode.getLocFromIndex(outer.property.range[1]),
            start: sourceCode.getLocFromIndex(inner.property.range[0]),
          },
        })
      },
    }
  },
})
