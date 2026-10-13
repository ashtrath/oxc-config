import { RuleTester } from 'oxlint/plugins-dev'

import { requireSafetyCommentForTypeAssertion } from './require-safety-comment-for-type-assertion'

const ruleTester = new RuleTester()
const error = { messageId: 'missingSafetyComment' }

ruleTester.run('require-safety-comment-for-type-assertion', requireSafetyCommentForTypeAssertion, {
  invalid: [
    {
      name: 'unjustified as assertion',
      code: 'const id = value as UserId;',
      errors: [error],
    },
    {
      name: 'unjustified angle-bracket assertion',
      code: 'const id = <UserId>value;',
      errors: [error],
    },
    {
      name: 'trailing safety comment after assertion',
      code: 'const id = value as UserId; // SAFETY: Too late.',
      errors: [error],
    },
    {
      name: 'unrelated preceding comment',
      code: '// This cast seems fine.\nconst id = value as UserId;',
      errors: [error],
    },
    {
      name: 'safety marker with empty invariant text',
      code: '// SAFETY:\nconst id = value as UserId;',
      errors: [error],
    },
    {
      name: 'safety marker with whitespace only',
      code: '// SAFETY:   \nconst id = value as UserId;',
      errors: [error],
    },
    {
      name: 'inline block comment with whitespace only',
      code: 'const id = /* SAFETY: */ value as UserId;',
      errors: [error],
    },
    {
      name: 'exported variable declaration without safety comment',
      code: 'export const id = value as UserId;',
      errors: [error],
    },
    {
      name: 'exported declaration with unrelated preceding comment',
      code: '// This is not a safety justification.\nexport const id = value as UserId;',
      errors: [error],
    },
    {
      name: 'unconfigured marker rejected when custom markers specified',
      code: '// SAFETY: This marker is not configured.\nconst value = input as User;',
      errors: [error],
      options: [{ markers: ['INVARIANT'] }],
    },
    {
      name: 'custom marker with whitespace only',
      code: '// INVARIANT:   \nconst value = input as User;',
      errors: [error],
      options: [{ markers: ['INVARIANT'] }],
    },
  ],
  valid: [
    {
      name: 'const assertion with as keyword',
      code: 'const values = [1, 2] as const;',
    },
    {
      name: 'const assertion with angle-bracket syntax',
      code: 'const value = <const>{ id: "one" };',
    },
    {
      name: 'SAFETY comment before variable declaration',
      code: '// SAFETY: The parser established the UserId invariant.\nconst id = value as UserId;',
    },
    {
      name: 'INVARIANT comment before variable declaration',
      code: '// INVARIANT: The parser established the UserId invariant.\nconst id = value as UserId;',
    },
    {
      name: 'SAFETY comment before return statement',
      code: 'function parse(): UserId {\n// SAFETY: Validation above established the UserId invariant.\nreturn value as UserId;\n}',
    },
    {
      name: 'INVARIANT comment before return statement',
      code: 'function parse(): UserId {\n// INVARIANT: Validation above established the UserId invariant.\nreturn value as UserId;\n}',
    },
    {
      name: 'inline SAFETY comment immediately before assertion',
      code: 'const id = /* SAFETY: Validation established the invariant. */ value as UserId;',
    },
    {
      name: 'SAFETY comment before exported variable declaration',
      code: '// SAFETY: The parser established the exported UserId invariant.\nexport const id = value as UserId;',
    },
    {
      name: 'multiline SAFETY comment before exported variable declaration',
      code: '/* SAFETY:\n * The parser established the exported UserId invariant.\n */\nexport const id = value as UserId;',
    },
    {
      name: 'SAFETY comment before export default',
      code: '// SAFETY: Checked invariant.\nexport default value as UserId;',
    },
    {
      name: 'custom marker option',
      code: '// CUSTOM: The caller parsed this value.\nconst value = input as User;',
      options: [{ markers: ['CUSTOM'] }],
    },
    {
      name: 'custom marker with regex special characters',
      code: '// SAFE+: The caller parsed this value.\nconst value = input as User;',
      options: [{ markers: ['SAFE+'] }],
    },
    {
      name: 'multiple custom markers',
      code: '// SAFETY: The caller parsed this value.\nconst value = input as User;',
      options: [{ markers: ['INVARIANT', 'SAFETY'] }],
    },
  ],
})
