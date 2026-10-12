import type { ESTree, SourceCode, Variable } from '@oxlint/plugins'

import { defineRule } from '@oxlint/plugins'

import {
  arrayMethodTarget,
  getConstInit,
  isGlobalCopyOwner,
  isKnownArrayExpression,
  resolveArrayBinding,
  unwrapArrayExpression,
} from '../lib/array'
import { getNodeParent } from '../lib/utils'

interface ReducerInfo {
  accumulator: ESTree.Node
  callback: ESTree.Node
  initialValue: ESTree.Node | undefined
}

function enclosingReducer(node: ESTree.Node): ReducerInfo | null {
  let parent = getNodeParent(node)
  while (parent !== null) {
    if (parent.type === 'FunctionDeclaration') return null
    if (parent.type === 'ArrowFunctionExpression' || parent.type === 'FunctionExpression') {
      const callback = parent
      let owner = getNodeParent(callback)
      while (owner !== null && unwrapArrayExpression(owner) === callback) {
        owner = getNodeParent(owner)
      }
      if (owner === null || owner.type !== 'CallExpression') return null
      const method = arrayMethodTarget(owner.callee)
      const firstArgument = owner.arguments[0]
      if (
        method === null ||
        (method.name !== 'reduce' && method.name !== 'reduceRight') ||
        owner.arguments.length > 2 ||
        firstArgument === undefined ||
        unwrapArrayExpression(firstArgument) !== callback
      ) {
        return null
      }
      const firstParameter = callback.params[0]
      let accumulator: ESTree.Node | undefined
      if (firstParameter) {
        accumulator =
          firstParameter.type === 'AssignmentPattern' ? firstParameter.left : firstParameter
      }
      if (!accumulator || accumulator.type !== 'Identifier') return null
      return { accumulator, callback, initialValue: owner.arguments[1] }
    }
    parent = getNodeParent(parent)
  }
  return null
}

function referencesAccumulator(
  sourceCode: SourceCode,
  node: ESTree.Node,
  accumulator: Variable,
  visited = new Set<Variable>(),
): boolean {
  const variable = resolveArrayBinding(sourceCode, node)
  if (variable === null || visited.has(variable)) return false
  if (variable === accumulator) return true
  visited.add(variable)
  if (variable.references.some(reference => reference.isWrite() && !reference.init)) return false
  const init = getConstInit(variable)
  if (init !== null) {
    return referencesAccumulator(sourceCode, init, accumulator, visited)
  }
  return false
}

/**
 * Disallows copying growing reducer accumulators with Object.assign, array spreads, Array.from, or
 * array copying methods.
 */
export const noReduceAccumulatorCopy = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow copying growing reducer accumulators with Object.assign, array spreads, Array.from, or array copy methods.',
    },
    messages: {
      accumulatorCopy:
        'Do not copy the reducer accumulator on every iteration; growing copies can cause quadratic work. Mutate a fresh, locally owned accumulator and return it, or use an iterator pipeline/flatMap.',
    },
  },

  createOnce(context) {
    function resolveReducerContext(node: ESTree.Node): {
      reducer: ReducerInfo
      isAccumulator: (expression: ESTree.Node) => boolean
    } | null {
      const reducer = enclosingReducer(node)
      if (reducer === null) return null

      const declared = context.sourceCode.getDeclaredVariables(reducer.callback)
      const accumulator = declared.find(variable =>
        variable.identifiers.some(
          identifier =>
            identifier.start === reducer.accumulator.start ||
            identifier.range[0] === reducer.accumulator.range[0],
        ),
      )
      if (accumulator === undefined) return null

      return {
        reducer,
        isAccumulator: (expression: ESTree.Node): boolean =>
          referencesAccumulator(context.sourceCode, expression, accumulator),
      }
    }

    return {
      before() {
        return context.sourceCode.text.includes('reduce')
      },

      ArrayExpression(node) {
        const contextInfo = resolveReducerContext(node)
        if (contextInfo === null) return

        const hasAccumulatorSpread = node.elements.some(
          element =>
            element !== null &&
            element.type === 'SpreadElement' &&
            contextInfo.isAccumulator(element.argument),
        )

        if (hasAccumulatorSpread) {
          context.report({ messageId: 'accumulatorCopy', node })
        }
      },

      CallExpression(node) {
        const method = arrayMethodTarget(node.callee)
        if (method === null) return

        const contextInfo = resolveReducerContext(node)
        if (contextInfo === null) return

        const { isAccumulator, reducer } = contextInfo

        let copiesAccumulator = false
        if (
          method.name === 'assign' &&
          isGlobalCopyOwner(context.sourceCode, method.object, 'Object')
        ) {
          const target = node.arguments[0]
          copiesAccumulator =
            target !== undefined &&
            unwrapArrayExpression(target).type === 'ObjectExpression' &&
            node.arguments.slice(1).some(isAccumulator)
        } else if (
          method.name === 'from' &&
          isGlobalCopyOwner(context.sourceCode, method.object, 'Array')
        ) {
          const source = node.arguments[0]
          copiesAccumulator = source !== undefined && isAccumulator(source)
        } else if (
          ['concat', 'slice', 'toReversed', 'toSorted', 'toSpliced', 'with'].includes(method.name)
        ) {
          const initialValue = reducer.initialValue
          const arrayAccumulator =
            initialValue !== undefined && isKnownArrayExpression(context.sourceCode, initialValue)
          copiesAccumulator = arrayAccumulator && isAccumulator(method.object)
        }

        if (copiesAccumulator) {
          context.report({ messageId: 'accumulatorCopy', node })
        }
      },
    }
  },
})
