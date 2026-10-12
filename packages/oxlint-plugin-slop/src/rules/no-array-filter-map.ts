import type { ESTree } from '@oxlint/plugins'

import { defineRule } from '@oxlint/plugins'

import { arrayMethodTarget, isKnownArrayExpression, unwrapArrayExpression } from '../lib/array'

/**
 * Configuration options for the `slop/no-array-filter-map` rule.
 */
export interface NoArrayFilterMapOptions {
  /**
   * Whether to ignore consecutive passes when `.filter(Boolean)` is used.
   *
   * @default false
   */
  ignoreBooleanFilter?: boolean
}

function isBooleanFilter(call: ESTree.CallExpression): boolean {
  const argument = call.arguments[0]
  if (argument === undefined) return false

  const unwrapped = unwrapArrayExpression(argument)
  return unwrapped.type === 'Identifier' && unwrapped.name === 'Boolean'
}

/**
 * Disallows consecutive array filter and map passes in favor of lazy iterator helpers, a single
 * flatMap, or a single loop pass.
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
        const outer = arrayMethodTarget(node.callee)
        if (outer === null || (outer.name !== 'map' && outer.name !== 'filter')) return

        const innerCall = unwrapArrayExpression(outer.object)
        if (innerCall.type !== 'CallExpression') return

        const inner = arrayMethodTarget(innerCall.callee)
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
