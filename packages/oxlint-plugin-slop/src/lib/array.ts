import type { ESTree, Scope, SourceCode, Variable } from '@oxlint/plugins'

import { getNodeParent } from './utils'

const WRAPPER_TYPES: ReadonlySet<string> = new Set([
  'ChainExpression',
  'ParenthesizedExpression',
  'TSAsExpression',
  'TSNonNullExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
])

const CAST_TYPES: ReadonlySet<string> = new Set([
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
])

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
  while (WRAPPER_TYPES.has(current.type)) {
    if (
      CAST_TYPES.has(current.type) &&
      'typeAnnotation' in current &&
      current.typeAnnotation &&
      isArrayAnnotation(current.typeAnnotation as ESTree.TSType)
    ) {
      return true
    }
    if ('expression' in current && current.expression) {
      current = current.expression as ESTree.Node
    } else {
      break
    }
  }
  return false
}

export function unwrapArrayExpression(node: ESTree.Node): ESTree.Node {
  let current: ESTree.Node = node
  while (WRAPPER_TYPES.has(current.type)) {
    if ('expression' in current && current.expression) {
      current = current.expression as ESTree.Node
    } else {
      break
    }
  }
  return current
}

export function resolveArrayBinding(sourceCode: SourceCode, node: ESTree.Node): Variable | null {
  const unwrapped = unwrapArrayExpression(node)
  if (unwrapped.type !== 'Identifier') return null

  let scope: Scope | null = sourceCode.getScope(unwrapped)
  while (scope !== null) {
    const variable = scope.set.get(unwrapped.name)
    if (variable !== undefined) return variable
    scope = scope.upper
  }

  return null
}

interface ArrayMethodTarget {
  readonly name: string
  readonly object: ESTree.Node
  readonly property: ESTree.Node
}

export function arrayMethodTarget(node: ESTree.Node): ArrayMethodTarget | null {
  const unwrapped = unwrapArrayExpression(node)
  if (unwrapped.type !== 'MemberExpression') return null

  const property = unwrapped.property
  if (!unwrapped.computed && property.type === 'Identifier') {
    return { name: property.name, object: unwrapped.object, property }
  }

  if (unwrapped.computed && property.type === 'Literal' && typeof property.value === 'string') {
    return { name: property.value, object: unwrapped.object, property }
  }

  return null
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

export function isGlobalCopyOwner(
  sourceCode: SourceCode,
  node: ESTree.Node,
  name: string,
): boolean {
  const unwrapped = unwrapArrayExpression(node)
  if (unwrapped.type !== 'Identifier' || unwrapped.name !== name) return false

  const variable = resolveArrayBinding(sourceCode, unwrapped)
  return variable === null || variable.defs.length === 0
}

function isKnownArrayCall(
  sourceCode: SourceCode,
  call: ESTree.CallExpression,
  visited: Set<Variable>,
): boolean {
  if (isGlobalCopyOwner(sourceCode, call.callee, 'Array')) return true

  const method = arrayMethodTarget(call.callee)
  if (method === null) return false

  if (
    (method.name === 'from' || method.name === 'of') &&
    isGlobalCopyOwner(sourceCode, method.object, 'Array')
  ) {
    return true
  }

  if (
    OBJECT_ARRAY_STATICS.has(method.name) &&
    isGlobalCopyOwner(sourceCode, method.object, 'Object')
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

  const unwrapped = unwrapArrayExpression(node)
  if (unwrapped.type === 'ArrayExpression') return true
  if (unwrapped.type === 'NewExpression') {
    return isGlobalCopyOwner(sourceCode, unwrapped.callee, 'Array')
  }
  if (unwrapped.type === 'CallExpression') {
    return isKnownArrayCall(sourceCode, unwrapped, visited)
  }
  if (unwrapped.type !== 'Identifier') return false

  const variable = resolveArrayBinding(sourceCode, unwrapped)
  if (variable === null || visited.has(variable)) return false
  visited.add(variable)
  if (variable.references.some(reference => reference.isWrite() && !reference.init)) return false

  for (const identifier of variable.identifiers) {
    const annotation = getIdentifierTypeAnnotation(identifier)
    if (annotation !== null && isArrayAnnotation(annotation)) return true
  }

  const init = getConstInit(variable)
  if (init !== null) {
    return isKnownArrayExpression(sourceCode, init, visited)
  }

  return false
}

export function outermostExpression(node: ESTree.Node): ESTree.Node {
  let current = node
  for (let parent = getNodeParent(current); parent !== null; parent = getNodeParent(current)) {
    if (
      !WRAPPER_TYPES.has(parent.type) ||
      !('expression' in parent) ||
      parent.expression !== current
    ) {
      break
    }
    current = parent
  }
  return current
}

export function getConstInit(variable: Variable): ESTree.Node | null {
  for (const definition of variable.defs) {
    if (
      definition.type === 'Variable' &&
      definition.node.type === 'VariableDeclarator' &&
      definition.node.id.type === 'Identifier' &&
      definition.node.init !== null &&
      definition.node.parent.type === 'VariableDeclaration' &&
      definition.node.parent.kind === 'const'
    ) {
      return definition.node.init
    }
  }
  return null
}
