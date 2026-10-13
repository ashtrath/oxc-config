/* oxlint-disable slop/no-jargon, sonarjs/cognitive-complexity -- rule documentation demonstrates jargon terms, and token masking visitor requires nested scanning */
import type { Context } from '@oxlint/plugins'

import { defineRule } from '@oxlint/plugins'

import { maskPreservingOffsets } from '../lib/prose'

interface CompiledConfig {
  ignoreJSDoc: boolean
  regex: RegExp
}

const DEFAULT_WORDS_WITHOUT_REPLACEMENT: readonly string[] = [
  'aforementioned',
  'bolster',
  'bolstered',
  'bolsters',
  'bolstering',
  'endeavor',
  'endeavors',
  'endeavour',
  'endeavours',
  'holistic',
  'holistically',
  'interplay',
  'meticulous',
  'meticulously',
  'multifaceted',
  'myriad',
  'nuance',
  'nuanced',
  'nuances',
  'pivotal',
  'plethora',
  'robust',
  'robustly',
  'seamless',
  'seamlessly',
  'synergies',
  'synergy',
  'testament',
]

const DEFAULT_REPLACEMENTS: Readonly<Record<string, string>> = {
  additionally: 'also',
  commence: 'start',
  commenced: 'started',
  commences: 'starts',
  commencing: 'starting',
  comprehensive: 'complete',
  comprehensively: 'thoroughly',
  crucial: 'important',
  crucially: 'importantly',
  delve: 'explore',
  delved: 'explored',
  delves: 'explores',
  delving: 'exploring',
  encompass: 'include',
  encompassed: 'included',
  encompasses: 'includes',
  encompassing: 'including',
  facilitate: 'help',
  facilitated: 'helped',
  facilitates: 'helps',
  facilitating: 'helping',
  foster: 'support',
  fostered: 'supported',
  fostering: 'supporting',
  fosters: 'supports',
  leverage: 'use',
  leveraged: 'used',
  leverages: 'uses',
  leveraging: 'using',
  paramount: 'important',
  streamline: 'simplify',
  streamlined: 'simplified',
  streamlines: 'simplifies',
  streamlining: 'simplifying',
  utilise: 'use',
  utilised: 'used',
  utilises: 'uses',
  utilising: 'using',
  utilize: 'use',
  utilized: 'used',
  utilizes: 'uses',
  utilizing: 'using',
}

const DEFAULT_WORDS: readonly string[] = [
  ...Object.keys(DEFAULT_REPLACEMENTS),
  ...DEFAULT_WORDS_WITHOUT_REPLACEMENT,
]

const COMMENT_DELIMITER_LENGTH = 2

const MASK_REGEX =
  /```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`|https?:\/\/\S+|^\s*(?:(?:eslint|oxlint|biome|prettier)-[a-z-]+|@?ts-(?:ignore|expect-error|nocheck|check))\b[^\n]*/gim

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function compileConfig(options: NoJargonOptions | undefined): CompiledConfig | null {
  const allow = new Set((options?.allow ?? []).map(word => word.toLowerCase()))
  const words = new Set<string>()

  for (const word of [...DEFAULT_WORDS, ...(options?.extraWords ?? [])]) {
    const lower = word.trim().toLowerCase()
    if (lower && !allow.has(lower)) words.add(lower)
  }

  if (words.size === 0) return null

  const alternation = [...words].map(escapeRegex).join('|')
  const regex = new RegExp(`(?<![\\p{L}\\p{N}_])(?:${alternation})(?![\\p{L}\\p{N}_])`, 'giu')

  return { ignoreJSDoc: options?.ignoreJSDoc ?? false, regex }
}

function preserveCase(original: string, replacement: string): string {
  if (original === original.toUpperCase()) return replacement.toUpperCase()
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1)
  }
  return replacement
}

function isQuoted(text: string, start: number, end: number): boolean {
  if (start === 0 || end >= text.length) return false
  const prev = text[start - 1]
  return (prev === '"' || prev === "'") && text[end] === prev
}

/**
 * Configuration options for {@link noJargon}.
 */
export interface NoJargonOptions {
  /**
   * Words to allow even if present in the default forbidden word list.
   */
  allow?: string[]
  /**
   * Additional forbidden words to disallow alongside the default list.
   */
  extraWords?: string[]
  /**
   * Whether to ignore JSDoc block comments (`/** ... *\/`).
   *
   * @defaultValue false
   */
  ignoreJSDoc?: boolean
}

/**
 * Disallows conversational jargon and filler words in comments.
 *
 * @remarks
 *   Flags conversational filler terms and buzzwords in code comments. Suggests plainer alternatives
 *   where available, such as replacing "utilize" with "use". Words inside inline code backticks,
 *   URLs, code fences, and linter directives are ignored.
 * @example
 *   // Incorrect
 *   // We utilize this helper to process input.
 *
 *   // Correct
 *   // We use this helper to process input.
 */
export const noJargon = defineRule({
  meta: {
    type: 'suggestion',
    hasSuggestions: true,
    docs: {
      description: 'Disallow conversational jargon and AI filler terms in comments.',
    },
    messages: {
      jargon: 'Avoid "{{word}}" in comments. Prefer plainer wording a person would type.',
      replace: 'Replace "{{word}}" with "{{replacement}}".',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allow: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
          },
          extraWords: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
          },
          ignoreJSDoc: {
            type: 'boolean',
            default: false,
          },
        },
      },
    ],
  },
  createOnce(context: Context) {
    let config: CompiledConfig | null | undefined

    return {
      before() {
        if (config === undefined) {
          const options = (context.options as readonly unknown[])[0] as NoJargonOptions | undefined
          config = compileConfig(options)
        }
        return config !== null
      },

      Program() {
        if (!config) return

        const { ignoreJSDoc, regex } = config
        const { sourceCode } = context

        for (const comment of sourceCode.getAllComments()) {
          if (comment.type === 'Shebang') continue
          if (ignoreJSDoc && comment.type === 'Block' && comment.value.startsWith('*')) continue
          if (comment.value.search(regex) === -1) continue

          const masked = comment.value.replace(MASK_REGEX, maskPreservingOffsets)
          const base = comment.range[0] + COMMENT_DELIMITER_LENGTH

          regex.lastIndex = 0
          let match: RegExpExecArray | null = regex.exec(masked)

          while (match !== null) {
            const word = match[0]
            const index = match.index
            const matchStart = base + index
            const matchEnd = matchStart + word.length

            if (!isQuoted(masked, index, index + word.length)) {
              const replacementBase = DEFAULT_REPLACEMENTS[word.toLowerCase()]
              const replacement = replacementBase ? preserveCase(word, replacementBase) : null

              context.report({
                data: { word },
                messageId: 'jargon',
                loc: {
                  end: sourceCode.getLocFromIndex(matchEnd),
                  start: sourceCode.getLocFromIndex(matchStart),
                },
                ...(replacement && {
                  suggest: [
                    {
                      data: { replacement, word },
                      messageId: 'replace' as const,
                      fix: fixer => fixer.replaceTextRange([matchStart, matchEnd], replacement),
                    },
                  ],
                }),
              })
            }

            regex.lastIndex = Math.max(index + word.length, index + 1)
            match = regex.exec(masked)
          }
        }
      },
    }
  },
})
