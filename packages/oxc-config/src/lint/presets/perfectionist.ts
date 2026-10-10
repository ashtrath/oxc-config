import type { AllowWarnDeny } from 'oxlint'

import type { OxlintConfigItem, PerfectionistOptions } from '../types'

import { perfectionistPlugin } from '../plugins'

export async function perfectionist(options: PerfectionistOptions): Promise<OxlintConfigItem> {
  const { isInEditor = false, overrides = {} } = options

  const severity: AllowWarnDeny = isInEditor ? 'warn' : 'error'

  return {
    jsPlugins: [perfectionistPlugin],
    rules: {
      'sort-keys': 'off',

      'perfectionist/sort-exports': [severity, { type: 'natural', order: 'asc' }],
      'perfectionist/sort-heritage-clauses': [severity, { type: 'natural', order: 'asc' }],
      'perfectionist/sort-named-exports': [severity, { type: 'natural', order: 'asc' }],
      'perfectionist/sort-named-imports': [severity, { type: 'natural', order: 'asc' }],
      'perfectionist/sort-jsx-props': [
        severity,
        {
          type: 'natural',
          groups: ['reserved', 'shorthand-prop', 'unknown', 'callback', 'multiline-prop'],
          order: 'asc',
          customGroups: [
            { elementNamePattern: '^(key|ref)$', groupName: 'reserved' },
            { elementNamePattern: '^on[A-Z].*', groupName: 'callback' },
          ],
        },
      ],
      'perfectionist/sort-object-types': [
        severity,
        {
          type: 'natural',
          groups: ['top', 'unknown', 'callback', 'method', 'multiline-member'],
          order: 'asc',
          partitionByComment: true,
          partitionByNewLine: true,
          customGroups: [
            {
              elementNamePattern: '^(?:id|key|name|type)$',
              groupName: 'top',
              selector: 'property',
            },
            { elementNamePattern: '^on[A-Z].*', groupName: 'callback', selector: 'property' },
          ],
        },
      ],
      'perfectionist/sort-objects': [
        severity,
        {
          type: 'natural',
          groups: ['top', 'unknown', 'callback', 'method', 'multiline-member'],
          order: 'asc',
          partitionByComment: true,
          partitionByNewLine: true,
          customGroups: [
            {
              elementNamePattern: '^(?:id|key|name|type)$',
              groupName: 'top',
              selector: 'property',
            },
            { elementNamePattern: '^on[A-Z].*', groupName: 'callback', selector: 'property' },
          ],
          useConfigurationIf: {
            objectType: 'non-destructured',
          },
        },
        {
          type: 'unsorted',
        },
      ],

      ...overrides,
    },
  }
}
