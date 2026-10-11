import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'oxc-config',
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          include: ['test/*.test.ts'],
        },
      },
    ],
  },
})
