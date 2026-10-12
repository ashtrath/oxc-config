import { RuleTester } from 'oxlint/plugins-dev'

import { maxCommentLength } from './max-comment-length'

const ruleTester = new RuleTester()

const generateWords = (count: number): string =>
  Array.from({ length: count }, (_, i) => `word${i + 1}`).join(' ')

ruleTester.run('max-comment-length', maxCommentLength, {
  invalid: [
    {
      code: `// ${generateWords(51)}`,
      errors: [
        {
          data: { count: 51, maximum: 50 },
          messageId: 'tooLong',
        },
      ],
    },
    {
      code: `// ${generateWords(30)}\n// ${generateWords(25)}`,
      errors: [
        {
          data: { count: 55, maximum: 50 },
          messageId: 'tooLong',
        },
      ],
    },
    {
      code: `/* ${generateWords(52)} */`,
      errors: [
        {
          data: { count: 52, maximum: 50 },
          messageId: 'tooLong',
        },
      ],
    },
    {
      code: '// one two three four five six',
      options: [{ maximumWords: 5 }],
      errors: [
        {
          data: { count: 6, maximum: 5 },
          messageId: 'tooLong',
        },
      ],
    },
    {
      code: `/** ${generateWords(55)} */`,
      options: [{ ignoreJSDoc: false }],
      errors: [
        {
          data: { count: 55, maximum: 50 },
          messageId: 'tooLong',
        },
      ],
    },
  ],
  valid: [
    '// This is a concise comment explaining the non-obvious invariant.',
    `// ${generateWords(50)}`,
    `// ${generateWords(45)} https://example.com/very/long/path/with/lots/of/segments/and/query?params=1&other=2`,
    `// Brief description followed by code:\n// \`\`\`ts\n// const a = 1\n// const b = 2\n// const c = 3\n// const d = 4\n// \`\`\``,
    '// oxlint-disable-next-line eslint/no-unused-vars',
    `/**\n * ${generateWords(60)}\n */`,
    {
      code: `// ${generateWords(60)}`,
      options: [{ maximumWords: 100 }],
    },
  ],
})
