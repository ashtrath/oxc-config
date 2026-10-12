import type { Context } from '@oxlint/plugins'

import { defineRule } from '@oxlint/plugins'

const EM_DASH = '\u2014'
const SENTENCE_TERMINATORS = new Set(['.', '!', '?'])
const WHITESPACE = /\s/

function getSentenceRange(
  text: string,
  index: number,
  boundStart: number,
  boundEnd: number,
): { end: number; start: number } {
  let start = index
  while (start > boundStart) {
    const char = text[start - 1]
    if (char === '\n' || SENTENCE_TERMINATORS.has(char)) break
    start -= 1
  }

  let end = index + 1
  while (end < boundEnd) {
    const char = text[end]
    if (char === '\n') break
    end += 1
    if (SENTENCE_TERMINATORS.has(char)) break
  }

  while (start < index && WHITESPACE.test(text[start])) start += 1
  while (end > index + 1 && WHITESPACE.test(text[end - 1])) end -= 1

  return { end, start }
}

function scanRange(range: readonly [number, number], context: Context): void {
  const { sourceCode } = context
  const text = sourceCode.text
  const snippet = text.slice(range[0], range[1])

  let localIndex = snippet.indexOf(EM_DASH)
  while (localIndex !== -1) {
    const sentence = getSentenceRange(text, range[0] + localIndex, range[0], range[1])

    context.report({
      messageId: 'avoid',
      loc: {
        end: sourceCode.getLocFromIndex(sentence.end),
        start: sourceCode.getLocFromIndex(sentence.start),
      },
    })

    localIndex = snippet.indexOf(EM_DASH, Math.max(sentence.end - range[0], localIndex + 1))
  }
}

export const noEmDash = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow em dashes in source text.',
    },
    messages: {
      avoid:
        'Avoid em dashes. Split the sentence or rewrite it using shorter, plainer sentence structures.',
    },
  },
  createOnce(context) {
    return {
      before() {
        return context.sourceCode.text.includes(EM_DASH)
      },
      JSXText(node) {
        if (node.range) {
          scanRange(node.range, context)
        }
      },
      Literal(node) {
        if (typeof node.value === 'string' && node.range) {
          scanRange(node.range, context)
        }
      },
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          scanRange(comment.range, context)
        }
      },
      TemplateElement(node) {
        if (node.range) {
          scanRange(node.range, context)
        }
      },
    }
  },
})
