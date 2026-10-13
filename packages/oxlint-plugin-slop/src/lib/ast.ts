import type { ESTree } from '@oxlint/plugins'

export type TypeAssertionExpression = ESTree.TSAsExpression | ESTree.TSTypeAssertion

export type TypeCastExpression =
  | ESTree.TSAsExpression
  | ESTree.TSSatisfiesExpression
  | ESTree.TSTypeAssertion

export interface StaticMemberTarget {
  readonly name: string
  readonly object: ESTree.Node
  readonly property: ESTree.Node
}

export interface UnwrapExpressionOptions {
  readonly stopAtCasts?: boolean
}

const CAST_NODE_TYPES: ReadonlySet<string> = new Set([
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
])

const WRAPPER_NODE_TYPES: ReadonlySet<string> = new Set([
  'ChainExpression',
  'ParenthesizedExpression',
  'TSAsExpression',
  'TSNonNullExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
])

/**
 * Returns the parent AST node if attached, otherwise null.
 */
export function getNodeParent(node: ESTree.Node): ESTree.Node | null {
  if ('parent' in node && node.parent) {
    return node.parent
  }
  return null
}

/**
 * Peels outer ParenthesizedExpression nodes from an expression.
 */
export function unwrapParenthesizedExpression<T extends ESTree.Node>(node: T): T {
  let current: ESTree.Node = node
  while (current.type === 'ParenthesizedExpression') {
    current = (current as ESTree.ParenthesizedExpression).expression
  }
  return current as T
}

/**
 * Type guard checking if a node is a TypeScript type assertion (`as` or `<Type>`).
 */
export function isTypeAssertion(
  node: ESTree.Node | null | undefined,
): node is TypeAssertionExpression {
  return node?.type === 'TSAsExpression' || node?.type === 'TSTypeAssertion'
}

/**
 * Type guard checking if a node is any TypeScript cast (`as`, `satisfies`, or `<Type>`).
 */
export function isTypeCast(node: ESTree.Node | null | undefined): node is TypeCastExpression {
  return (
    node?.type === 'TSAsExpression' ||
    node?.type === 'TSSatisfiesExpression' ||
    node?.type === 'TSTypeAssertion'
  )
}

/**
 * Returns true if a node is an `as const` or `<const>` assertion.
 */
export function isConstAssertion(node: TypeAssertionExpression | ESTree.Node): boolean {
  if (!isTypeAssertion(node)) return false

  const { typeAnnotation } = node
  return (
    typeAnnotation.type === 'TSTypeReference' &&
    typeAnnotation.typeName.type === 'Identifier' &&
    typeAnnotation.typeName.name === 'const'
  )
}

/**
 * Peels expression wrappers (parentheses, chaining, non-null assertions, and type casts). When
 * `options.stopAtCasts` is true, stops before unwrapping `as`, `satisfies`, or `<T>`.
 */
export function unwrapExpression(
  node: ESTree.Node,
  options?: UnwrapExpressionOptions,
): ESTree.Node {
  let current: ESTree.Node = node

  while (WRAPPER_NODE_TYPES.has(current.type)) {
    if (options?.stopAtCasts && CAST_NODE_TYPES.has(current.type)) {
      break
    }
    if ('expression' in current && current.expression) {
      current = current.expression as ESTree.Node
    } else {
      break
    }
  }

  return current
}

/**
 * Resolves static property access from dot notation or string literal computed bracket notation.
 */
export function getStaticMemberTarget(node: ESTree.Node): StaticMemberTarget | null {
  const unwrapped = unwrapExpression(node)
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
