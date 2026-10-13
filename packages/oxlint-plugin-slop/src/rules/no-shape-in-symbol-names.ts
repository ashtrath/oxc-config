import type { ESTree } from '@oxlint/plugins'

import { defineRule } from '@oxlint/plugins'

import { getNodeParent } from '../lib/ast'

type NamedSymbolNode =
  | ESTree.BindingIdentifier
  | ESTree.IdentifierName
  | ESTree.IdentifierReference
  | ESTree.JSXIdentifier
  | ESTree.PrivateIdentifier

const FORBIDDEN_TERM = 'shape'

function isBorrowedMemberName(node: ESTree.Node): boolean {
  const parent = getNodeParent(node)
  if (!parent) return false

  if (parent.type === 'MemberExpression') {
    return parent.property === node && !parent.computed
  }

  if (parent.type === 'Property' && parent.key === node && !parent.computed) {
    const grandparent = getNodeParent(parent)
    return grandparent?.type === 'ObjectPattern' && parent.value !== node
  }

  return false
}

/**
 * Disallows the substring "shape" in JavaScript, TypeScript, private, and JSX symbol names.
 *
 * @remarks
 *   Symbol names should describe domain ownership and purpose rather than structural shape.
 *   Borrowed member accesses on external objects (such as `schema.shape.id`) are permitted.
 * @example
 *   // Incorrect
 *   const userShape = { id: '1' }
 *   type PayloadShape = { id: string }
 *
 *   // Correct
 *   const user = { id: '1' }
 *   type Payload = { id: string }
 *   const field = schema.shape.id
 */
export const noShapeInSymbolNames = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow the case-insensitive substring "shape" in JavaScript, TypeScript, private, and JSX symbol names.',
    },
    messages: {
      forbiddenSymbolName:
        'Rename symbol "{{name}}" for its domain role; "shape" describes structure rather than ownership.',
    },
  },
  createOnce(context) {
    const reportForbiddenSymbol = (node: NamedSymbolNode): void => {
      if (!node.name.toLowerCase().includes(FORBIDDEN_TERM) || isBorrowedMemberName(node)) {
        return
      }

      context.report({
        data: { name: node.name },
        messageId: 'forbiddenSymbolName',
        node,
      })
    }

    return {
      Identifier: reportForbiddenSymbol,
      JSXIdentifier: reportForbiddenSymbol,
      PrivateIdentifier: reportForbiddenSymbol,
    }
  },
})
