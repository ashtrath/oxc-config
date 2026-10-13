import type { ESTree } from '@oxlint/plugins'

export function getLineIndent(text: string, index: number): string | null {
  const lineStart = text.lastIndexOf('\n', index - 1) + 1
  const prefix = text.slice(lineStart, index)
  return prefix.trim() === '' ? prefix : null
}

export function startsOwnLine(text: string, index: number): boolean {
  return getLineIndent(text, index) !== null
}

export function maskPreservingOffsets(span: string): string {
  return span.replace(/[^\n]/g, ' ')
}

export function getNodeParent(node: ESTree.Node): ESTree.Node | null {
  if ('parent' in node && node.parent) {
    return node.parent
  }

  return null
}

export function unwrapParenthesizedExpression<T extends ESTree.Node>(node: T): T {
  let current: ESTree.Node = node
  while (current.type === 'ParenthesizedExpression') {
    current = (current as ESTree.ParenthesizedExpression).expression
  }
  return current as T
}

export type TypeAssertionExpression = ESTree.TSAsExpression | ESTree.TSTypeAssertion

export function isConstAssertion(node: TypeAssertionExpression): boolean {
  const { typeAnnotation } = node
  return (
    typeAnnotation.type === 'TSTypeReference' &&
    typeAnnotation.typeName.type === 'Identifier' &&
    typeAnnotation.typeName.name === 'const'
  )
}
