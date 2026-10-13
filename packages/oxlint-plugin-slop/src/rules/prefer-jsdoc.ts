import type { Comment, Context, Node } from '@oxlint/plugins'

import { defineRule } from '@oxlint/plugins'

import { getLineIndent } from '../lib/prose'

interface AstNode {
  parent?: AstNode | null
  type?: string
}

interface ClassMemberNode extends Node {
  accessibility?: string
  key?: unknown
}

const DIRECTIVE_REGEX =
  /^\/?\s*(?:eslint\b|@?ts-(?:ignore|expect-error|nocheck|check)\b|globals?\b|exported\b|prettier-ignore\b|[cv]8\s+(?:ignore|enable|disable)\b|istanbul\s+ignore\b|biome-ignore\b|oxlint\b|noinspection\b|<reference\b|<amd-|#(?:end)?region\b|@(?:jsx|jsxImportSource|jsxFrag|jsxRuntime|flow)\b|@(?:vitest|jest)-environment\b)/iu
const COPYRIGHT_REGEX = /^(?:copyright\b|spdx-license-identifier\b|©|licensed\s+under\b|license:)/iu
const TASK_TAG_REGEX = /^(?:TODO|FIXME|HACK|XXX)\b/u
const LEADING_SPACE_REGEX = /^\s?/u

const DECLARATIONS: ReadonlySet<string> = new Set([
  'ClassDeclaration',
  'ClassExpression',
  'TSEnumDeclaration',
  'TSInterfaceDeclaration',
  'TSTypeAliasDeclaration',
])

const SCOPE_BOUNDARIES: ReadonlySet<string> = new Set([
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
  'TSConstructorType',
  'TSDeclareFunction',
  'TSFunctionType',
])

const MEMBER_TYPES: ReadonlySet<string> = new Set([
  'AccessorProperty',
  'MethodDefinition',
  'PropertyDefinition',
  'TSAbstractAccessorProperty',
  'TSAbstractMethodDefinition',
  'TSAbstractPropertyDefinition',
  'TSCallSignatureDeclaration',
  'TSConstructSignatureDeclaration',
  'TSIndexSignature',
  'TSMethodSignature',
  'TSPropertySignature',
])

function parentOf(node: Node): AstNode | null | undefined {
  return (node as unknown as AstNode).parent
}

function isMemberOfExportedDeclaration(node: Node): boolean {
  let current = parentOf(node)
  while (current) {
    const type = current.type
    if (type) {
      if (SCOPE_BOUNDARIES.has(type) || MEMBER_TYPES.has(type)) return false
      if (DECLARATIONS.has(type)) {
        const parentType = current.parent?.type
        return parentType === 'ExportNamedDeclaration' || parentType === 'ExportDefaultDeclaration'
      }
    }
    current = current.parent
  }
  return false
}

function getRunBefore(node: Node, comments: readonly Comment[], sourceText: string): Comment[] {
  const run: Comment[] = []
  let expectedEndLine = node.loc.start.line - 1

  for (let i = comments.length - 1; i >= 0; i--) {
    const comment = comments[i]
    if (comment.type !== 'Line' || comment.loc.end.line !== expectedEndLine) break
    // A trailing comment (`code // note`) belongs to its own line, not to the next node.
    if (getLineIndent(sourceText, comment.range[0]) === null) break
    run.unshift(comment)
    expectedEndLine = comment.loc.start.line - 1
  }

  return run
}

/**
 * Requires JSDoc block comments on exported declarations and public members instead of line
 * comments.
 *
 * @remarks
 *   Editors and language servers display JSDoc comments (`/** ... *\/`) on hover and in completion
 *   tooltips. Line comments (`// ...`) are not surfaced by language tools. Unexported declarations,
 *   task tags (`TODO:`, `FIXME:`), and linter directives are exempt.
 * @example
 *   // Incorrect
 *   // User display name.
 *   export const userName = 'Alice';
 *
 *   // Correct
 *   /** User display name. *\/
 *   export const userName = 'Alice';
 */
export const preferJsdoc = defineRule({
  meta: {
    type: 'suggestion',
    fixable: 'code',
    schema: [],
    docs: {
      description:
        'Require JSDoc /** */ comments on exported declarations and public members instead of // line comments.',
    },
    messages: {
      preferJsdoc: 'Document this with a /** */ block so editors show it on hover.',
    },
  },
  createOnce(context: Context) {
    function checkNode(node: Node, isMember: boolean): void {
      const { sourceCode } = context
      const comments = sourceCode.getCommentsBefore(node)
      if (comments.length === 0) return

      const sourceText = sourceCode.text
      const run = getRunBefore(node, comments, sourceText)
      if (run.length === 0) return

      const firstRunIndex = comments.indexOf(run[0])
      if (firstRunIndex > 0) {
        const preceding = comments[firstRunIndex - 1]
        if (
          preceding.type === 'Block' &&
          preceding.value.startsWith('*') &&
          preceding.loc.end.line + 1 === run[0].loc.start.line
        ) {
          return
        }
      }

      const first = run[0]
      const last = run[run.length - 1]
      const firstText = first.value.trim()

      if (COPYRIGHT_REGEX.test(firstText) || TASK_TAG_REGEX.test(firstText)) return
      if (run.some(c => DIRECTIVE_REGEX.test(c.value.trim()))) return

      const lines = run.map(c => c.value.replace(LEADING_SPACE_REGEX, '').trimEnd())
      if (lines.every(line => line === '')) return

      if (isMember && !isMemberOfExportedDeclaration(node)) return

      const indent = getLineIndent(sourceText, first.range[0]) ?? ''
      const eol = sourceText.includes('\r\n') ? '\r\n' : '\n'

      const jsdoc =
        lines.length === 1
          ? `/** ${lines[0]} */`
          : `/**${eol}${lines.map(line => `${indent} * ${line}`.trimEnd()).join(eol)}${eol}${indent} */`

      // `*/` in the text would close the block early, so report without a fix.
      const canFix = !lines.some(line => line.includes('*/'))
      const range: [number, number] = [first.range[0], last.range[1]]

      context.report({
        loc: { end: last.loc.end, start: first.loc.start },
        messageId: 'preferJsdoc',
        ...(canFix && { fix: fixer => fixer.replaceTextRange(range, jsdoc) }),
      })
    }

    function checkClassMember(node: Node): void {
      const member = node as ClassMemberNode
      if (member.accessibility === 'private' || member.accessibility === 'protected') return
      if ((member.key as { type?: string } | undefined)?.type === 'PrivateIdentifier') return
      checkNode(node, true)
    }

    function checkTypeMember(node: Node): void {
      checkNode(node, true)
    }

    return {
      before() {
        return context.sourceCode.getAllComments().length > 0
      },

      AccessorProperty: checkClassMember,
      MethodDefinition: checkClassMember,
      PropertyDefinition: checkClassMember,
      TSAbstractAccessorProperty: checkClassMember,
      TSAbstractMethodDefinition: checkClassMember,
      TSAbstractPropertyDefinition: checkClassMember,
      TSCallSignatureDeclaration: checkTypeMember,
      TSConstructSignatureDeclaration: checkTypeMember,
      TSEnumMember: checkTypeMember,
      TSIndexSignature: checkTypeMember,
      TSMethodSignature: checkTypeMember,
      TSPropertySignature: checkTypeMember,
      ExportDefaultDeclaration(node) {
        checkNode(node, false)
      },
      ExportNamedDeclaration(node) {
        if (node.declaration) checkNode(node, false)
      },
    }
  },
})
