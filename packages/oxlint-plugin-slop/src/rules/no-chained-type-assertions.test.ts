import { RuleTester } from 'oxlint/plugins-dev'

import { noChainedTypeAssertions } from './no-chained-type-assertions'

const ruleTester = new RuleTester()
const error = { messageId: 'chained' }

ruleTester.run('no-chained-type-assertions', noChainedTypeAssertions, {
  invalid: [
    {
      name: 'as chain',
      code: 'const value = input as unknown as User;',
      errors: [error],
    },
    {
      name: 'parenthesized as chain',
      code: 'const value = (input as unknown) as User;',
      errors: [error],
    },
    {
      name: 'deeply parenthesized as chain',
      code: 'const value = (((input as any))) as string;',
      errors: [error],
    },
    {
      name: 'angle-bracket chain',
      code: 'const value = <User>(<unknown>input);',
      errors: [error],
    },
    {
      name: 'mixed as and angle-bracket chain',
      code: 'const value = (<unknown>input) as User;',
      errors: [error],
    },
    {
      name: 'mixed const and non-const chain',
      code: 'const value = ({ id: 1 } as const) as User;',
      errors: [error],
    },
    {
      name: 'triple assertion chain',
      code: 'const value = input as any as unknown as string;',
      errors: [error],
    },
  ],
  valid: [
    'const value = input as User;',
    'const value = (input as User);',
    'const value = <User>input;',
    'const value = (<User>input);',
    'const value = ({ id: 1 } as const) as const;',
    'const value = <const><const>({ id: 1 });',
    'const value = (<const>({ id: 1 })) as const;',
    'const value = fn(input as unknown) as User;',
    'const value = [x as string] as const;',
    'const value = (cond ? (a as string) : b) as unknown;',
  ],
})
