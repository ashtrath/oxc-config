import ashtrathLint from '@ashtrath/oxc-config/lint'

export default ashtrathLint({
  type: 'lib',
  antislop: true,
  ignorePatterns: ['**/__fixtures__/**'],
  tailwindcss: true,
  vitest: true,
  jsx: {
    a11y: true,
  },
  nextjs: {
    reactDoctor: true,
  },
  react: {
    reactDoctor: true,
  },
  typescript: {
    typeAware: true,
  },
})
