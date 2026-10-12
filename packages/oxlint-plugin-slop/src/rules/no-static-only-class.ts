import type { ESTree } from '@oxlint/plugins'

import { defineRule } from '@oxlint/plugins'

import { getNodeParent } from '../lib/utils'

type ClassNode = ESTree.Class
type ClassMember = ESTree.ClassElement

function isDecorated(node: ESTree.Node): boolean {
  return 'decorators' in node && Array.isArray(node.decorators) && node.decorators.length > 0
}

function isAmbientContext(node: ESTree.Node): boolean {
  let current: ESTree.Node | null = node
  while (current !== null) {
    if ('declare' in current && Boolean(current.declare)) return true
    current = getNodeParent(current)
  }
  return false
}

function isBoilerplateConstructor(member: ClassMember): boolean {
  if (member.type !== 'MethodDefinition' || member.kind !== 'constructor' || member.static) {
    return false
  }

  const { params, body } = member.value
  if (params.length !== 0) return false

  return body === null || body.body.length === 0 || member.accessibility === 'private'
}

function hasClassShellSignals(node: ClassNode): boolean {
  return Boolean(
    node.superClass ||
    node.abstract ||
    isDecorated(node) ||
    isAmbientContext(node) ||
    (Array.isArray(node.implements) && node.implements.length > 0),
  )
}

function isStaticMember(member: ClassMember): boolean {
  return member.type === 'StaticBlock' || ('static' in member && member.static === true)
}

function isStaticOnlyClass(node: ClassNode): boolean {
  let hasStatic = false

  for (const member of node.body.body) {
    if (isDecorated(member)) return false
    if (isBoilerplateConstructor(member)) continue
    if (!isStaticMember(member)) return false

    hasStatic = true
  }

  return hasStatic
}

/**
 * Disallows classes that group only static members and act as namespace shells.
 *
 * @example
 *   // Incorrect
 *   class MathUtils {
 *     static add(a: number, b: number) {
 *       return a + b
 *     }
 *   }
 *
 *   // Correct
 *   export function add(a: number, b: number) {
 *     return a + b
 *   }
 */
export const noStaticOnlyClass = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow classes that group only static members.',
    },
    messages: {
      staticOnly:
        'This class only groups static members and works as a namespace. Prefer standalone functions (plus module-level state when needed) over a class shell.',
    },
  },
  createOnce(context) {
    const checkClass = (node: ClassNode): void => {
      if (hasClassShellSignals(node) || !isStaticOnlyClass(node)) return

      context.report({
        messageId: 'staticOnly',
        node: node.id ?? node,
      })
    }

    return {
      ClassDeclaration: checkClass,
      ClassExpression: checkClass,
    }
  },
})
