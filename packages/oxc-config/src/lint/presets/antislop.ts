import type { ExternalPluginEntry } from 'oxlint'

import type { AntislopOptions, OxlintConfigItem } from '../types'

import { GLOB_SRC } from '../../shared/globs'
import { ensurePackages, resolvePlugin } from '../../shared/utils'

export async function antislop(options: AntislopOptions = {}): Promise<OxlintConfigItem> {
  const { cognitiveComplexity = 15, overrides = {}, slop = true, sonarjs = true } = options

  await ensurePackages([
    ...(slop ? ['@ashtrath/oxlint-plugin-slop'] : []),
    ...(sonarjs ? ['eslint-plugin-sonarjs'] : []),
  ])

  const jsPlugins: ExternalPluginEntry[] = []

  if (slop) {
    jsPlugins.push({
      name: 'slop',
      specifier: resolvePlugin('@ashtrath/oxlint-plugin-slop'),
    })
  }

  if (sonarjs) {
    jsPlugins.push({
      name: 'sonarjs',
      specifier: resolvePlugin('eslint-plugin-sonarjs'),
    })
  }

  return {
    overrides: [
      {
        files: [GLOB_SRC],
        jsPlugins,
        rules: {
          ...(slop
            ? {
                'slop/no-em-dash': 'error',

                'slop/max-comment-length': 'warn',
                'slop/no-jargon': 'warn',
                'slop/prefer-jsdoc': 'warn',

                'slop/no-trivial-functions': 'error',
                'slop/no-trivial-type-aliases': 'error',
              }
            : {}),

          ...(sonarjs
            ? {
                ...(cognitiveComplexity === false
                  ? {}
                  : { 'sonarjs/cognitive-complexity': ['error', cognitiveComplexity] }),

                'sonarjs/no-all-duplicated-branches': 'error',
                'sonarjs/no-collapsible-if': 'error',
                'sonarjs/no-commented-code': 'error',
                'sonarjs/no-dead-store': 'error',
                'sonarjs/no-duplicated-branches': 'error',
                'sonarjs/no-element-overwrite': 'error',
                'sonarjs/no-empty-collection': 'error',
                'sonarjs/no-gratuitous-expressions': 'error',
                'sonarjs/no-identical-conditions': 'error',
                'sonarjs/no-identical-expressions': 'error',
                'sonarjs/no-identical-functions': 'error',
                'sonarjs/no-invariant-returns': 'error',
                'sonarjs/no-inverted-boolean-check': 'error',
                'sonarjs/no-redundant-boolean': 'error',
                'sonarjs/no-redundant-jump': 'error',
                'sonarjs/no-unused-collection': 'error',
                'sonarjs/no-use-of-empty-return-value': 'error',
                'sonarjs/prefer-single-boolean-return': 'error',
              }
            : {}),

          ...overrides,
        },
      },
    ],
  }
}
