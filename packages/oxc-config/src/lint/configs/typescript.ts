import type { OxlintConfig, OxlintOverride } from 'oxlint'

import type { TypescriptOptions } from '../types'

import { isPackageExists } from 'local-pkg'

import { GLOB_TS, GLOB_TSX } from '../../shared/globs'

// TODO: add oxlint-tsgolint package check for type aware rules
export function typescript(options: TypescriptOptions = {}): OxlintOverride[] {
  const {
    files = [GLOB_TS, GLOB_TSX],
    type = 'app',
    overrides = {},
    typeAware = false,
    filesTypeAware = [GLOB_TS, GLOB_TSX],
    overridesTypeAware = {},
  } = options

  const isTypeAware = typeAware && isPackageExists('oxlint-tsgolint')

  const typeAwareRules: OxlintConfig['rules'] = {
    'no-implied-eval': 'off',

    'typescript/no-deprecated': 'warn',

    'typescript/await-thenable': 'error',
    'typescript/dot-notation': ['error', { allowKeywords: true }],
    'typescript/no-floating-promises': 'error',
    'typescript/no-for-in-array': 'error',
    'typescript/no-implied-eval': 'error',
    'typescript/no-misused-promises': 'error',
    'typescript/no-unnecessary-type-assertion': 'error',
    'typescript/no-unsafe-argument': 'error',
    'typescript/no-unsafe-assignment': 'error',
    'typescript/no-unsafe-call': 'error',
    'typescript/no-unsafe-member-access': 'error',
    'typescript/no-unsafe-return': 'error',
    'typescript/promise-function-async': 'error',
    'typescript/restrict-plus-operands': 'error',
    'typescript/restrict-template-expressions': 'error',
    'typescript/return-await': ['error', 'in-try-catch'],
    'typescript/switch-exhaustiveness-check': 'error',
    'typescript/unbound-method': 'error',
    'typescript/strict-boolean-expressions': [
      'error',
      {
        allowNullableBoolean: true,
        allowNullableObject: true,
      },
    ],
  }

  return [
    {
      files,
      plugins: ['typescript'],
      rules: {
        'constructor-super': 'off',
        'getter-return': 'off',
        'no-class-assign': 'off',
        'no-const-assign': 'off',
        'no-dupe-keys': 'off',
        'no-func-assign': 'off',
        'no-import-assign': 'off',
        'no-new-native-nonconstructor': 'off',
        'no-obj-calls': 'off',
        'no-setter-return': 'off',
        'no-this-before-super': 'off',
        'no-undef': 'off',
        'no-unreachable': 'off',
        'no-unsafe-negation': 'off',
        'no-useless-constructor': 'off',
        'no-with': 'off',

        'no-array-constructor': 'error',
        'no-dupe-class-members': 'error',
        'no-redeclare': ['error', { builtinGlobals: false }],
        'no-unused-vars': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'no-unused-expressions': [
          'error',
          {
            allowShortCircuit: true,
            allowTaggedTemplates: true,
            allowTernary: true,
          },
        ],
        'no-use-before-define': [
          'error',
          {
            classes: false,
            functions: false,
            variables: true,
          },
        ],

        'typescript/no-dynamic-delete': 'off',
        'typescript/no-explicit-any': 'off',
        'typescript/no-extraneous-class': 'off',
        'typescript/no-invalid-void-type': 'off',
        'typescript/no-non-null-assertion': 'off',
        'typescript/triple-slash-reference': 'off',
        'typescript/unified-signatures': 'off',

        'typescript/ban-ts-comment': ['error', { 'ts-expect-error': 'allow-with-description' }],
        'typescript/consistent-type-definitions': ['error', 'interface'],
        'typescript/method-signature-style': ['error', 'property'], // https://www.totaltypescript.com/method-shorthand-syntax-considered-harmful
        'typescript/no-duplicate-enum-values': 'error',
        'typescript/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
        'typescript/no-extra-non-null-assertion': 'error',
        'typescript/no-import-type-side-effects': 'error',
        'typescript/no-misused-new': 'error',
        'typescript/no-namespace': 'error',
        'typescript/no-non-null-asserted-nullish-coalescing': 'error',
        'typescript/no-non-null-asserted-optional-chain': 'error',
        'typescript/no-require-imports': 'error',
        'typescript/no-this-alias': 'error',
        'typescript/no-unnecessary-type-constraint': 'error',
        'typescript/no-unsafe-declaration-merging': 'error',
        'typescript/no-unsafe-function-type': 'error',
        'typescript/no-wrapper-object-types': 'error',
        'typescript/prefer-as-const': 'error',
        'typescript/prefer-literal-enum-member': 'error',
        'typescript/prefer-namespace-keyword': 'error',
        'typescript/consistent-type-imports': [
          'error',
          {
            disallowTypeAnnotations: false,
            fixStyle: 'separate-type-imports',
            prefer: 'type-imports',
          },
        ],

        ...(type === 'lib'
          ? {
              'typescript/explicit-function-return-type': [
                'error',
                {
                  allowExpressions: true,
                  allowHigherOrderFunctions: true,
                  allowIIFEs: true,
                },
              ],
            }
          : {}),

        ...overrides,
      },
    },
    ...(isTypeAware
      ? [
          {
            files: filesTypeAware,
            rules: {
              ...typeAwareRules,
              ...overridesTypeAware,
            },
          },
        ]
      : []),
  ]
}
