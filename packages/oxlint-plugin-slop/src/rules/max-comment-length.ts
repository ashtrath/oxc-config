import type { Comment, Context } from '@oxlint/plugins'

import { defineRule } from '@oxlint/plugins'

import { startsOwnLine } from '../lib/prose'

export interface MaxCommentLengthOptions {
  ignoreJSDoc?: boolean
  maximumWords?: number
}

interface CommentGroup {
  endIndex: number
  endLoc: Comment['loc']['end']
  joinable: boolean
  parts: string[]
  startIndex: number
  startLoc: Comment['loc']['start']
}

const DEFAULT_IGNORE_JSDOC = true
const DEFAULT_MAXIMUM_WORDS = 50

const URL_REGEX = /https?:\/\/\S+/g
const CODE_FENCE_REGEX = /```[\s\S]*?```|~~~[\s\S]*?~~~/g
const LINTER_DIRECTIVE_REGEX =
  /^\s*(?:(?:eslint|oxlint|biome|prettier)-(?:disable|enable|ignore)(?:-[a-z]+)*|@?ts-(?:ignore|expect-error|nocheck|check)|(?:istanbul|c8|v8)\s+(?:ignore|enable|disable)|#(?:end)?region|@(?:vitest|jest)-environment)\b[^\n]*/gimu

const BLOCK_LINE_PREFIX_REGEX = /^\s*\* ?/
const WHITESPACE_REGEX = /\s+/u
const WORD_CHAR_REGEX = /[\p{L}\p{N}]/u

function extractBlockText(value: string): string {
  return value
    .split('\n')
    .map(line => line.replace(BLOCK_LINE_PREFIX_REGEX, ''))
    .join('\n')
}

function cleanCommentText(rawText: string): string {
  return rawText
    .replace(CODE_FENCE_REGEX, '')
    .replace(URL_REGEX, '')
    .replace(LINTER_DIRECTIVE_REGEX, '')
}

function countWords(text: string): number {
  let count = 0
  for (const token of text.split(WHITESPACE_REGEX)) {
    // Skips bullets, dashes and stray delimiters such as `-`, `*` or `/`.
    if (WORD_CHAR_REGEX.test(token)) count += 1
  }
  return count
}

function groupComments(
  comments: readonly Comment[],
  sourceText: string,
  ignoreJSDoc: boolean,
): CommentGroup[] {
  const groups: CommentGroup[] = []
  let current: CommentGroup | null = null

  for (const comment of comments) {
    if (comment.type === 'Shebang') continue

    const [start, end] = comment.range

    if (comment.type === 'Block') {
      if (current) {
        groups.push(current)
        current = null
      }

      if (ignoreJSDoc && comment.value.startsWith('*')) continue

      groups.push({
        endIndex: end,
        endLoc: comment.loc.end,
        joinable: false,
        parts: [extractBlockText(comment.value)],
        startIndex: start,
        startLoc: comment.loc.start,
      })
      continue
    }

    const ownLine = startsOwnLine(sourceText, start)
    if (
      current &&
      current.joinable &&
      ownLine &&
      current.endLoc.line + 1 === comment.loc.start.line
    ) {
      current.parts.push(comment.value)
      current.endIndex = end
      current.endLoc = comment.loc.end
      continue
    }

    if (current) groups.push(current)

    current = {
      endIndex: end,
      endLoc: comment.loc.end,
      joinable: ownLine,
      parts: [comment.value],
      startIndex: start,
      startLoc: comment.loc.start,
    }
  }

  if (current) groups.push(current)
  return groups
}

/**
 * Rule that enforces a maximum word limit on prose comments.
 *
 * @example
 *   ;```ts
 *   // Avoid:
 *   // A multi-line comment spanning more than 50 words that narrates code mechanics.
 *
 *   // Prefer:
 *   // Concise note explaining non-obvious invariants.
 *   ```
 */
export const maxCommentLength = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce a maximum word limit on prose comments.',
    },
    messages: {
      tooLong:
        'This comment has {{count}} words; the configured maximum is {{maximum}}. Keep only context the code cannot express.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          ignoreJSDoc: {
            type: 'boolean',
            default: DEFAULT_IGNORE_JSDOC,
          },
          maximumWords: {
            type: 'integer',
            default: DEFAULT_MAXIMUM_WORDS,
            minimum: 1,
          },
        },
      },
    ],
  },
  createOnce(context: Context) {
    let ignoreJSDoc = DEFAULT_IGNORE_JSDOC
    let maximumWords = DEFAULT_MAXIMUM_WORDS

    return {
      before() {
        const options = context.options[0] as MaxCommentLengthOptions | undefined
        ignoreJSDoc = options?.ignoreJSDoc ?? DEFAULT_IGNORE_JSDOC
        maximumWords = options?.maximumWords ?? DEFAULT_MAXIMUM_WORDS
      },

      Program() {
        const { sourceCode } = context
        const groups = groupComments(sourceCode.getAllComments(), sourceCode.text, ignoreJSDoc)

        for (const group of groups) {
          // Cleaning only removes characters, and joining only adds separators
          // already present in the source. Exceeding the limit needs at least
          // `maximumWords + 1` tokens and `maximumWords` separators.
          if (group.endIndex - group.startIndex <= maximumWords * 2) continue

          const count = countWords(cleanCommentText(group.parts.join('\n')))
          if (count <= maximumWords) continue

          context.report({
            messageId: 'tooLong',
            data: {
              count,
              maximum: maximumWords,
            },
            loc: {
              end: group.endLoc,
              start: group.startLoc,
            },
          })
        }
      },
    }
  },
})
