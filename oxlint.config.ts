import ashtrathLint from '@ashtrath/oxc-config/lint'

export default ashtrathLint(
  {
    type: 'lib',
    typescript: true,
  },
  {
    overrides: [
      {
        files: ['**/bin/**'],
        rules: {
          'antfu/no-import-dist': 'off',
        },
      },
    ],
  },
)
