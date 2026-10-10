import type { ExternalPluginEntry } from 'oxlint'

import { resolvePlugin } from '../shared/utils'

export const antfuPlugin: ExternalPluginEntry = {
  name: 'antfu',
  specifier: resolvePlugin('eslint-plugin-antfu'),
}

export const commandPlugin: ExternalPluginEntry = {
  name: 'command',
  specifier: resolvePlugin('eslint-plugin-command'),
}

export const e18ePlugin: ExternalPluginEntry = {
  name: 'e18e',
  specifier: resolvePlugin('@e18e/eslint-plugin'),
}

export const oxlintCommentsPlugin: ExternalPluginEntry = {
  name: 'oxlint-comments',
  specifier: resolvePlugin('oxlint-plugin-directive-comments'),
}

export const perfectionistPlugin: ExternalPluginEntry = {
  name: 'perfectionist',
  specifier: resolvePlugin('eslint-plugin-perfectionist'),
}

export const regexpPlugin: ExternalPluginEntry = {
  name: 'regexp',
  specifier: resolvePlugin('eslint-plugin-regexp'),
}
