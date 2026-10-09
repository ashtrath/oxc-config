import type { ExternalPluginEntry } from 'oxlint'

import { fileURLToPath } from 'node:url'

function resolvePlugin(name: string): string {
  return fileURLToPath(import.meta.resolve(name))
}

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

export const reactDoctorPlugin: ExternalPluginEntry = {
  name: 'react-doctor',
  specifier: resolvePlugin('oxlint-plugin-react-doctor'),
}

export const regexpPlugin: ExternalPluginEntry = {
  name: 'regexp',
  specifier: resolvePlugin('eslint-plugin-regexp'),
}

export const tailwindcssPlugin: ExternalPluginEntry = {
  name: 'tailwindcss',
  specifier: resolvePlugin('oxlint-tailwindcss'),
}
