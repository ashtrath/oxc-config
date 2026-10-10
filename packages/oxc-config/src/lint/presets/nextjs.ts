import type { NextJSOptions, OxlintConfigItem, Rules } from '../types'

import { GLOB_SRC } from '../../shared/globs'
import { ensurePackages, resolvePlugin } from '../../shared/utils'

export async function nextjs(options: NextJSOptions = {}): Promise<OxlintConfigItem> {
  const { files = [GLOB_SRC], reactDoctor = false, overrides = {} } = options

  let reactDoctorPlugin: any
  if (reactDoctor) {
    await ensurePackages(['oxlint-plugin-react-doctor'])

    reactDoctorPlugin = {
      name: 'react-doctor',
      specifier: resolvePlugin('oxlint-plugin-react-doctor'),
    }
  }

  const reactDoctorRules: Rules = {
    'react-doctor/nextjs-async-dynamic-api-not-awaited': 'error',
    'react-doctor/nextjs-error-boundary-missing-use-client': 'error',
    'react-doctor/nextjs-global-error-missing-html-body': 'error',
    'react-doctor/nextjs-no-default-export-in-route-handler': 'error',
    'react-doctor/nextjs-no-head-import': 'error',
    'react-doctor/nextjs-no-redirect-in-try-catch': 'error',
    'react-doctor/nextjs-no-side-effect-in-get-handler': 'error',
    'react-doctor/nextjs-no-use-search-params-without-suspense': 'error',
    'react-doctor/no-undeferred-third-party': 'error',
    'react-doctor/server-after-nonblocking': 'error',
    'react-doctor/server-auth-actions': 'error',
    'react-doctor/server-cache-with-object-literal': 'error',
    'react-doctor/server-no-mutable-module-state': 'error',

    'react-doctor/nextjs-image-missing-sizes': 'warn',
    'react-doctor/nextjs-metadata-url-consistency': 'warn',
    'react-doctor/nextjs-no-client-side-redirect': 'warn',
    'react-doctor/nextjs-no-edge-og-runtime': 'warn',
    'react-doctor/nextjs-no-vercel-og-import': 'warn',
  }

  return {
    overrides: [
      {
        files,
        ...(reactDoctor ? { jsPlugins: [reactDoctorPlugin] } : {}),
        plugins: ['nextjs'],
        rules: {
          // Nextjs's recommended rules
          // See: https://github.com/vercel/next.js/blob/canary/packages/eslint-plugin-next/src/index.ts#L26-L51
          'nextjs/google-font-display': 'warn',
          'nextjs/google-font-preconnect': 'warn',
          'nextjs/next-script-for-ga': 'warn',
          'nextjs/no-async-client-component': 'warn',
          'nextjs/no-before-interactive-script-outside-document': 'warn',
          'nextjs/no-css-tags': 'warn',
          'nextjs/no-head-element': 'warn',
          'nextjs/no-img-element': 'warn',
          // FIXME: Uncomment this when https://github.com/oxc-project/oxc/pull/26301 get merged.
          // 'nextjs/no-location-assign-relative-destination': 'warn',
          'nextjs/no-page-custom-font': 'warn',
          'nextjs/no-styled-jsx-in-document': 'warn',
          'nextjs/no-title-in-document-head': 'warn',
          'nextjs/no-typos': 'warn',
          'nextjs/no-unwanted-polyfillio': 'warn',

          'nextjs/inline-script-id': 'error',
          'nextjs/no-assign-module-variable': 'error',
          'nextjs/no-document-import-in-page': 'error',
          'nextjs/no-duplicate-head': 'error',
          'nextjs/no-head-import-in-document': 'error',
          'nextjs/no-script-component-in-head': 'error',

          // Core web vitals
          // See: https://github.com/vercel/next.js/blob/canary/packages/eslint-plugin-next/src/index.ts#L53-L56
          'nextjs/no-html-link-for-pages': 'error',
          'nextjs/no-sync-scripts': 'error',

          ...(reactDoctor ? reactDoctorRules : {}),

          ...overrides,
        },
      },
    ],
  }
}
