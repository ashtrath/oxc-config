import type { ESTree, Scope, SourceCode, Variable } from '@oxlint/plugins'

import { unwrapExpression } from './ast'

/**
 * Resolves the Variable binding for an identifier node by walking lexical scopes upward.
 */
export function resolveBinding(sourceCode: SourceCode, node: ESTree.Node): Variable | null {
  const unwrapped = unwrapExpression(node)
  if (unwrapped.type !== 'Identifier') return null

  let scope: Scope | null = sourceCode.getScope(unwrapped)
  while (scope !== null) {
    const variable = scope.set.get(unwrapped.name)
    if (variable !== undefined) return variable
    scope = scope.upper
  }

  return null
}

/**
 * Checks whether an expression references an unshadowed global variable matching name.
 */
export function isUnshadowedGlobal(
  sourceCode: SourceCode,
  node: ESTree.Node,
  name: string,
): boolean {
  const unwrapped = unwrapExpression(node)
  if (unwrapped.type !== 'Identifier' || unwrapped.name !== name) return false

  const variable = resolveBinding(sourceCode, unwrapped)
  return variable === null || variable.defs.length === 0
}

/**
 * Returns the initializer expression for a single-assignment variable (const, or let without
 * reassignments). Returns null if the variable has subsequent write references or lacks a
 * declarator init.
 */
export function getSingleAssignmentInit(variable: Variable): ESTree.Node | null {
  if (variable.references.some(reference => reference.isWrite() && !reference.init)) {
    return null
  }

  for (const definition of variable.defs) {
    if (
      definition.type === 'Variable' &&
      definition.node.type === 'VariableDeclarator' &&
      definition.node.id.type === 'Identifier' &&
      definition.node.init !== null
    ) {
      return definition.node.init
    }
  }

  return null
}
