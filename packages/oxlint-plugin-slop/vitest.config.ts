import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    name: 'oxlint-plugin-slop',
    projects: [
      {
        test: {
          name: 'unit',
          fileParallelism: false,
          include: ['src/**/*.test.ts'],
          setupFiles: ['./test/setup.ts'],
        },
      },
    ],
  },
})
