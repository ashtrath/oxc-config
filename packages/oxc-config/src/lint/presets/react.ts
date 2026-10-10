import type { OxlintConfigItem, ReactOptions } from '../types'

import { isPackageExists } from 'local-pkg'

import { GLOB_SRC, GLOB_TS, GLOB_TSX } from '../../shared/globs'
import { ensurePackages, resolvePlugin } from '../../shared/utils'

const REMIX_PACKAGES = ['@remix-run/node', '@remix-run/react', '@remix-run/serve', '@remix-run/dev']

const REACT_ROUTER_PACKAGES = [
  '@react-router/node',
  '@react-router/react',
  '@react-router/serve',
  '@react-router/dev',
]

export async function react(options: ReactOptions = {}): Promise<OxlintConfigItem> {
  const { files = [GLOB_SRC], reactDoctor = false, overrides = {} } = options

  let reactDoctorPlugin: any
  if (reactDoctor) {
    await ensurePackages(['oxlint-plugin-react-doctor'])

    reactDoctorPlugin = {
      name: 'react-doctor',
      specifier: resolvePlugin('oxlint-plugin-react-doctor'),
    }
  }

  const isAllowConstantExport = isPackageExists('vite')
  const isUsingNext = isPackageExists('next')
  const isUsingReactCompiler = isPackageExists('babel-plugin-react-compiler')
  const isUsingRemix = REMIX_PACKAGES.some(pkg => isPackageExists(pkg))
  const isUsingReactRouter = REACT_ROUTER_PACKAGES.some(pkg => isPackageExists(pkg))

  return {
    overrides: [
      {
        files,
        plugins: ['react'],
        ...(reactDoctor ? { jsPlugins: [reactDoctorPlugin] } : {}),
        rules: {
          'react/error-boundaries': 'error',
          'react/jsx-key': ['error', { checkKeyMustBeforeSpread: true }],
          'react/jsx-no-constructed-context-values': 'error',
          'react/jsx-no-script-url': 'error',
          'react/jsx-no-useless-fragment': 'error',
          'react/no-direct-mutation-state': 'error',
          'react/no-find-dom-node': 'error',
          'react/no-namespace': 'error',
          'react/no-render-return-value': 'error',
          'react/no-unescaped-entities': 'error',
          'react/no-unsafe': ['error', { checkAliases: true }],
          'react/no-unstable-nested-components': 'error',
          'react/rules-of-hooks': 'error',
          'react/set-state-in-render': 'error',
          'react/static-components': 'error',
          'react/unsupported-syntax': 'error',
          'react/use-memo': 'error',
          'react/void-dom-elements-no-children': 'error',
          'react/only-export-components': [
            'error',
            {
              allowConstantExport: isAllowConstantExport,
              allowExportNames: [
                ...(isUsingNext
                  ? [
                      // https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
                      'dynamic',
                      'dynamicParams',
                      'revalidate',
                      'fetchCache',
                      'runtime',
                      'preferredRegion',
                      'maxDuration',
                      // https://nextjs.org/docs/app/api-reference/functions/generate-static-params
                      'generateStaticParams',
                      // https://nextjs.org/docs/app/api-reference/functions/generate-metadata
                      'metadata',
                      'generateMetadata',
                      // https://nextjs.org/docs/app/api-reference/functions/generate-viewport
                      'viewport',
                      'generateViewport',
                      // https://nextjs.org/docs/app/api-reference/functions/generate-image-metadata
                      'generateImageMetadata',
                      // https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps
                      'generateSitemaps',
                    ]
                  : []),

                ...(isUsingRemix || isUsingReactRouter
                  ? [
                      'meta',
                      'links',
                      'headers',
                      'loader',
                      'action',
                      'clientLoader',
                      'clientAction',
                      'handle',
                      'shouldRevalidate',
                    ]
                  : []),
              ],
            },
          ],

          'react/exhaustive-deps': 'warn',
          'react/hook-use-state': 'warn',
          'react/iframe-missing-sandbox': 'warn',
          'react/jsx-handler-names': 'warn',
          'react/jsx-no-comment-textnodes': 'warn',
          'react/jsx-no-target-blank': 'warn',
          'react/jsx-pascal-case': 'warn',
          'react/no-array-index-key': 'warn',
          'react/no-children-prop': 'warn',
          'react/no-clone-element': 'warn',
          'react/no-danger': 'warn',
          'react/no-danger-with-children': 'warn',
          'react/no-did-mount-set-state': 'warn',
          'react/no-did-update-set-state': 'warn',
          'react/no-react-children': 'warn',
          'react/no-will-update-set-state': 'warn',
          'react/purity': 'warn',
          'react/set-state-in-effect': 'warn',

          ...(reactDoctor
            ? {
                'react-doctor/auth-token-in-web-storage': 'error',
                'react-doctor/effect-listener-cleanup-mismatch': 'error',
                'react-doctor/effect-listener-cleanup-reference-mismatch': 'error',
                'react-doctor/effect-needs-cleanup': 'error',
                'react-doctor/hooks-no-nan-in-deps': 'error',
                'react-doctor/html-no-invalid-paragraph-child': 'error',
                'react-doctor/html-no-invalid-table-nesting': 'error',
                'react-doctor/html-no-nested-interactive': 'error',
                'react-doctor/no-async-effect-callback': 'error',
                'react-doctor/no-call-component-as-function': 'error',
                'react-doctor/no-create-context-in-render': 'error',
                'react-doctor/no-create-ref-in-function-component': 'error',
                'react-doctor/no-create-store-in-render': 'error',
                'react-doctor/no-direct-state-mutation': 'error',
                'react-doctor/no-document-write': 'error',
                'react-doctor/no-effect-event-in-deps': 'error',
                'react-doctor/no-effect-with-fresh-deps': 'error',
                'react-doctor/no-mutable-in-deps': 'error',
                'react-doctor/no-mutating-reducer-state': 'error',
                'react-doctor/no-random-key': 'error',
                'react-doctor/no-secrets-in-client-code': 'error',
                'react-doctor/no-self-updating-effect': 'error',
                'react-doctor/no-string-false-on-boolean-attribute': 'error',
                'react-doctor/no-sync-xhr': 'error',
                'react-doctor/no-uncontrolled-input': 'error',
                // FIXME: Disable this when `jsx-no-leaked-render` get supported by Oxlint
                'react-doctor/rendering-conditional-render': 'error',
                'react-doctor/rendering-hydration-mismatch-time': 'error',

                'react-doctor/client-passive-event-listeners': 'warn',
                'react-doctor/debounce-no-cleanup': 'warn',
                'react-doctor/dialog-has-accessible-name': 'warn',
                'react-doctor/effect-observer-needs-disconnect': 'warn',
                'react-doctor/effect-raf-loop-needs-cancel': 'warn',
                'react-doctor/js-async-reduce-without-awaited-acc': 'warn',
                'react-doctor/js-hoist-intl': 'warn',
                'react-doctor/js-hoist-regexp': 'warn',
                'react-doctor/no-cascading-set-state': 'warn',
                'react-doctor/no-derived-useState': 'warn',
                'react-doctor/no-disabled-zoom': 'warn',
                'react-doctor/no-effect-chain': 'warn',
                'react-doctor/no-effect-event-handler': 'warn',
                'react-doctor/no-event-trigger-state': 'warn',
                'react-doctor/no-flush-sync': 'warn',
                'react-doctor/no-img-lazy-with-high-fetchpriority': 'warn',
                'react-doctor/no-layout-property-animation': 'warn',
                'react-doctor/no-mirror-prop-effect': 'warn',
                'react-doctor/no-moment': 'warn',
                'react-doctor/no-outline-none': 'warn',
                'react-doctor/no-prop-callback-in-effect': 'warn',
                'react-doctor/no-react19-deprecated-apis': 'warn',
                'react-doctor/no-react-dom-deprecated-apis': 'warn',
                'react-doctor/no-transition-all': 'warn',
                'react-doctor/rerender-dependencies': 'warn',
                'react-doctor/rerender-functional-setstate': 'warn',
                'react-doctor/rerender-lazy-ref-init': 'warn',
                'react-doctor/rerender-lazy-state-init': 'warn',
                'react-doctor/rerender-memo-before-early-return': 'warn',

                ...(isUsingReactCompiler
                  ? {}
                  : {
                      'react-doctor/no-inline-prop-on-memo-component': 'warn',
                      'react-doctor/prefer-stable-empty-fallback': 'warn',
                      'react-doctor/rerender-memo-with-default-value': 'warn',
                    }),
              }
            : {}),

          ...overrides,
        },
      },

      {
        files: [GLOB_TS, GLOB_TSX],
        plugins: ['react'],
        ...(reactDoctor ? { jsPlugins: [reactDoctorPlugin] } : {}),
        rules: {
          'react/no-unknown-property': 'off',
          'react/style-prop-object': 'off',

          ...(reactDoctor ? { 'react-doctor/no-jsx-element-type': 'error' } : {}),
        },
      },
    ],
  }
}
