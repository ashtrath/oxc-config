import type { ESTree, SourceCode, Variable } from '@oxlint/plugins'

import { getStaticMemberTarget, isTypeCast, unwrapExpression } from './ast'
import { getSingleAssignmentInit, isUnshadowedGlobal, resolveBinding } from './scope'

const ARRAY_RETURNING_METHODS: ReadonlySet<string> = new Set([
  'concat',
  'copyWithin',
  'fill',
  'filter',
  'flat',
  'flatMap',
  'map',
  'reverse',
  'slice',
  'sort',
  'splice',
  'toReversed',
  'toSorted',
  'toSpliced',
  'with',
])

const OBJECT_ARRAY_STATICS: ReadonlySet<string> = new Set([
  'entries',
  'getOwnPropertyNames',
  'getOwnPropertySymbols',
  'keys',
  'values',
])

function hasArrayCast(node: ESTree.Node): boolean {
  let current: ESTree.Node = node

  while (true) {
    const unwrapped = unwrapExpression(current, { stopAtCasts: true })
    if (!isTypeCast(unwrapped)) {
      break
    }

    if (
      'typeAnnotation' in unwrapped &&
      unwrapped.typeAnnotation &&
      isArrayAnnotation(unwrapped.typeAnnotation as ESTree.TSType)
    ) {
      return true
    }

    if ('expression' in unwrapped && unwrapped.expression) {
      current = unwrapped.expression as ESTree.Node
    } else {
      break
    }
  }

  return false
}

function getIdentifierTypeAnnotation(identifier: ESTree.Node): ESTree.TSType | null {
  if ('typeAnnotation' in identifier && identifier.typeAnnotation !== null) {
    const outer = identifier.typeAnnotation
    if (typeof outer === 'object' && 'typeAnnotation' in outer && outer.typeAnnotation !== null) {
      return outer.typeAnnotation as ESTree.TSType
    }
  }

  return null
}

export function isArrayAnnotation(type: ESTree.TSType): boolean {
  if (type.type === 'TSArrayType' || type.type === 'TSTupleType') return true
  if (type.type === 'TSParenthesizedType') return isArrayAnnotation(type.typeAnnotation)
  if (type.type === 'TSTypeOperator' && type.operator === 'readonly')
    return isArrayAnnotation(type.typeAnnotation)

  return (
    type.type === 'TSTypeReference' &&
    type.typeName.type === 'Identifier' &&
    (type.typeName.name === 'Array' || type.typeName.name === 'ReadonlyArray')
  )
}

function isKnownArrayCall(
  sourceCode: SourceCode,
  call: ESTree.CallExpression,
  visited: Set<Variable>,
): boolean {
  if (isUnshadowedGlobal(sourceCode, call.callee, 'Array')) return true

  const method = getStaticMemberTarget(call.callee)
  if (method === null) return false

  if (
    (method.name === 'from' || method.name === 'of') &&
    isUnshadowedGlobal(sourceCode, method.object, 'Array')
  ) {
    return true
  }

  if (
    OBJECT_ARRAY_STATICS.has(method.name) &&
    isUnshadowedGlobal(sourceCode, method.object, 'Object')
  ) {
    return true
  }

  return (
    ARRAY_RETURNING_METHODS.has(method.name) &&
    isKnownArrayExpression(sourceCode, method.object, visited)
  )
}

export function isKnownArrayExpression(
  sourceCode: SourceCode,
  node: ESTree.Node,
  visited = new Set<Variable>(),
): boolean {
  if (hasArrayCast(node)) return true

  const unwrapped = unwrapExpression(node)
  if (unwrapped.type === 'ArrayExpression') return true
  if (unwrapped.type === 'NewExpression') {
    return isUnshadowedGlobal(sourceCode, unwrapped.callee, 'Array')
  }
  if (unwrapped.type === 'CallExpression') {
    return isKnownArrayCall(sourceCode, unwrapped, visited)
  }
  if (unwrapped.type !== 'Identifier') return false

  const variable = resolveBinding(sourceCode, unwrapped)
  if (variable === null || visited.has(variable)) return false
  visited.add(variable)
  if (variable.references.some(reference => reference.isWrite() && !reference.init)) return false

  for (const identifier of variable.identifiers) {
    const annotation = getIdentifierTypeAnnotation(identifier)
    if (annotation !== null && isArrayAnnotation(annotation)) return true
  }

  const init = getSingleAssignmentInit(variable)
  if (init !== null) {
    return isKnownArrayExpression(sourceCode, init, visited)
  }

  return false
}
