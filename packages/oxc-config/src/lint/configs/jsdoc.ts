import type { OxlintOverride } from 'oxlint'

import { GLOB_SRC } from '../../shared/globs'

export function jsdoc(): OxlintOverride[] {
  return [
    {
      files: [GLOB_SRC],
      plugins: ['jsdoc'],
      rules: {
        'jsdoc/check-access': 'warn',
        // "jsdoc/check-param-names": "warn", // Not supported yet
        'jsdoc/check-property-names': 'warn',
        // 'jsdoc/check-types': 'warn', // Not supported yet
        'jsdoc/empty-tags': 'warn',
        'jsdoc/implements-on-classes': 'warn',
        'jsdoc/no-defaults': 'warn',
        // 'jsdoc/no-multi-asterisks': 'warn', // Not supported yet
        'jsdoc/require-param-name': 'warn',
        'jsdoc/require-property': 'warn',
        'jsdoc/require-property-description': 'warn',
        'jsdoc/require-property-name': 'warn',
        // 'jsdoc/require-returns-check': 'warn', // Not supported yet
        'jsdoc/require-returns-description': 'warn',
        // 'jsdoc/require-yields-check': 'warn', // Not supported yet
      },
    },
  ]
}
