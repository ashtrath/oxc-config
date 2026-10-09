import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'oxlint-plugin-slop',
    projects: [
      {
        test: {
          name: 'unit',
          include: ['**/*.test.ts'],
        },
      },
    ],
  },
})
