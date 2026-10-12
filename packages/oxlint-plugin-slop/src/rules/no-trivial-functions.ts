import type { ESTree, Variable } from '@oxlint/plugins'

import { defineRule } from '@oxlint/plugins'

import { getNodeParent, unwrapParenthesizedExpression } from '../lib/utils'

export interface NoTrivialFunctionsOptions {
  minimumReferences?: number
}

type FunctionNode = ESTree.ArrowFunctionExpression | ESTree.Function

interface ForwardedParameter {
  name: string
  rest: boolean
}

interface Candidate {
  name: string
  reportNode: ESTree.Node
}

const DEFAULT_MINIMUM_REFERENCES = 5

const EXPRESSION_WRAPPERS: ReadonlySet<string> = new Set([
  'TSAsExpression',
  'TSInstantiationExpression',
  'TSNonNullExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
])

function getForwardedParameterNames(node: FunctionNode): ForwardedParameter[] | null {
  const parameters: ForwardedParameter[] = []

  for (const parameter of node.params) {
    if (parameter.type === 'Identifier') {
      parameters.push({ name: parameter.name, rest: false })
      continue
    }

    if (parameter.type === 'RestElement' && parameter.argument.type === 'Identifier') {
      parameters.push({ name: parameter.argument.name, rest: true })
      continue
    }

    return null
  }

  return parameters
}

function getSingleExpression(node: FunctionNode): ESTree.Expression | null {
  if (!node.body) return null
  if (node.body.type !== 'BlockStatement') {
    return unwrapParenthesizedExpression(node.body as ESTree.Expression)
  }
  if (node.body.body.length !== 1) return null

  const statement = node.body.body[0]
  if (statement?.type === 'ReturnStatement' && statement.argument) {
    return unwrapParenthesizedExpression(statement.argument)
  }
  if (statement?.type === 'ExpressionStatement' && statement.expression.type === 'CallExpression') {
    return unwrapParenthesizedExpression(statement.expression)
  }
  return null
}

function isDirectParameterAccess(
  expression: ESTree.Expression,
  parameters: ForwardedParameter[],
): boolean {
  if (parameters.length !== 1) return false
  const parameter = parameters[0]
  if (!parameter || parameter.rest) return false

  let current: ESTree.Expression = expression
  while (current.type === 'MemberExpression') {
    if (current.optional) return false
    if (current.computed && current.property.type !== 'Literal') return false
    current = current.object
  }

  return current.type === 'Identifier' && current.name === parameter.name
}

function isTransparentCall(
  expression: ESTree.Expression,
  parameters: ForwardedParameter[],
): boolean {
  if (
    expression.type !== 'CallExpression' ||
    expression.optional ||
    expression.arguments.length !== parameters.length
  ) {
    return false
  }

  return expression.arguments.every((argument, index) => {
    const parameter = parameters[index]
    if (!parameter) return false
    if (parameter.rest) {
      return (
        argument.type === 'SpreadElement' &&
        argument.argument.type === 'Identifier' &&
        argument.argument.name === parameter.name
      )
    }
    return argument.type === 'Identifier' && argument.name === parameter.name
  })
}

function isTrivialFunction(node: FunctionNode): boolean {
  if (node.async || node.generator) return false

  const parameters = getForwardedParameterNames(node)
  const expression = getSingleExpression(node)
  if (!parameters || !expression) return false

  return (
    isDirectParameterAccess(expression, parameters) || isTransparentCall(expression, parameters)
  )
}

function isFunctionValue(node: ESTree.Node | null): node is FunctionNode {
  return node?.type === 'ArrowFunctionExpression' || node?.type === 'FunctionExpression'
}

function collect(program: ESTree.Program): {
  candidates: Candidate[]
  exportedNames: Set<string>
} {
  const candidates: Candidate[] = []
  const exportedNames = new Set<string>()

  for (const statement of program.body) {
    if (statement.type === 'ExportNamedDeclaration') {
      // `export function f() {}` is skipped entirely; only `export { f }` needs the name.
      if (!statement.source && statement.exportKind !== 'type') {
        for (const specifier of statement.specifiers) {
          if (specifier.exportKind !== 'type' && specifier.local.type === 'Identifier') {
            exportedNames.add(specifier.local.name)
          }
        }
      }
    } else if (statement.type === 'ExportDefaultDeclaration') {
      if (statement.declaration.type === 'Identifier') {
        exportedNames.add(statement.declaration.name)
      }
    } else if (statement.type === 'FunctionDeclaration') {
      if (statement.id && isTrivialFunction(statement)) {
        candidates.push({ name: statement.id.name, reportNode: statement })
      }
    } else if (statement.type === 'VariableDeclaration') {
      for (const declarator of statement.declarations) {
        if (
          declarator.id.type === 'Identifier' &&
          isFunctionValue(declarator.init) &&
          isTrivialFunction(declarator.init)
        ) {
          candidates.push({ name: declarator.id.name, reportNode: declarator })
        }
      }
    }
  }

  return { candidates, exportedNames }
}

function contains(outer: ESTree.Node, inner: ESTree.Node): boolean {
  return inner.range[0] >= outer.range[0] && inner.range[1] <= outer.range[1]
}

function isTypeOnlyReference(identifier: ESTree.Node): boolean {
  const parent = getNodeParent(identifier)
  if (!parent || !parent.type.startsWith('TS')) return false

  return !(
    EXPRESSION_WRAPPERS.has(parent.type) &&
    'expression' in parent &&
    parent.expression === identifier
  )
}

function countExternalReferences(
  variable: Variable,
  declaration: ESTree.Node,
  limit: number,
): number {
  let count = 0

  for (const reference of variable.references) {
    const identifier = reference.identifier as ESTree.Node
    if (contains(declaration, identifier) || isTypeOnlyReference(identifier)) continue

    count += 1
    if (count >= limit) break
  }

  return count
}

/**
 * Disallows top-level non-exported functions that only forward parameters or access a property
 * without adding substantial logic, when referenced fewer than a configured minimum number of
 * times.
 *
 * @example
 *   // Incorrect (fewer than 5 references)
 *   function getName(user) {
 *     return user.name
 *   }
 *   const parse = value => parseValue(value)
 *
 *   // Correct
 *   export function getName(user) {
 *     return user.name
 *   }
 *   const parse = value => parseValue(value.trim())
 */
export const noTrivialFunctions = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow low-use top-level forwarding and property-access functions.',
    },
    messages: {
      trivial:
        'This top-level trivial function has {{count}} external references; the configured minimum is {{minimum}}. Inline it or give the abstraction a broader role.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          minimumReferences: {
            type: 'integer',
            default: DEFAULT_MINIMUM_REFERENCES,
            minimum: 1,
          },
        },
      },
    ],
  },
  createOnce(context) {
    return {
      Program(node) {
        const options = context.options[0] as NoTrivialFunctionsOptions | undefined
        const minimum = options?.minimumReferences ?? DEFAULT_MINIMUM_REFERENCES

        const { candidates, exportedNames } = collect(node)

        for (const { name, reportNode } of candidates) {
          if (exportedNames.has(name)) continue

          const variable = context.sourceCode
            .getDeclaredVariables(reportNode)
            .find(item => item.name === name)

          if (!variable) continue

          const count = countExternalReferences(variable, reportNode, minimum)
          if (count >= minimum) continue

          context.report({
            messageId: 'trivial',
            node: reportNode,
            data: {
              count: String(count),
              minimum: String(minimum),
            },
          })
        }
      },
    }
  },
})
