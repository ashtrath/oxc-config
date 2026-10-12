import { RuleTester } from 'oxlint/plugins-dev'

import { noTrivialFunctions } from './no-trivial-functions'

const ruleTester = new RuleTester()
const error = { messageId: 'trivial' }

ruleTester.run('no-trivial-functions', noTrivialFunctions, {
  invalid: [
    {
      name: 'reports top-level single-expression property access with 1 reference',
      errors: [error],
      code: ['function getName(user: any) { return user.profile.name; }', 'getName(user);'].join(
        '\n',
      ),
    },
    {
      name: 'reports top-level transparent argument forwarding with 1 reference',
      code: ['const parse = (value: any) => parseValue(value);', 'parse(input);'].join('\n'),
      errors: [error],
    },
    {
      name: 'reports block statement with single return forwarding',
      errors: [error],
      code: [
        'const fetchUser = (id: string) => { return api.getUser(id); };',
        'fetchUser("123");',
      ].join('\n'),
    },
    {
      name: 'reports forwarding function with rest element',
      errors: [error],
      code: ['function delegate(...args: any[]) { return target(...args); }', 'delegate(1);'].join(
        '\n',
      ),
    },
    {
      name: 'reports when external references are below configured threshold',
      errors: [error],
      options: [{ minimumReferences: 3 }],
      code: [
        'const getName = (user: any) => user.name;',
        'getName(first);',
        'getName(second);',
      ].join('\n'),
    },
    {
      name: 'does not count recursive or type-only references',
      errors: [error],
      code: [
        'const forward = (value: any) => forward(value);',
        'type Forward = typeof forward;',
      ].join('\n'),
    },
    {
      name: 'does not treat type exports as public value interfaces',
      errors: [error],
      code: ['const parse = (value: any) => parseValue(value);', 'export type { parse };'].join(
        '\n',
      ),
    },
    {
      name: 'does not treat external re-exports as local value exports',
      errors: [error],
      code: [
        'const parse = (value: any) => parseValue(value);',
        'export { parse } from "./remote";',
      ].join('\n'),
    },
  ],
  valid: [
    'export function getName(user: any) { return user.name; }',
    'export const parse = (value: any) => parseValue(value);',
    ['const parse = (value: any) => parseValue(value);', 'export { parse };'].join('\n'),
    ['const format = (value: any) => formatValue(value);', 'export default format;'].join('\n'),
    'export default function format(value: any) { return formatValue(value); }',
    [
      'const getName = (user: any) => user.name;',
      'getName(a);',
      'getName(b);',
      'getName(c);',
      'getName(d);',
      'getName(e);',
    ].join('\n'),
    {
      options: [{ minimumReferences: 2 }],
      code: [
        'const getName = (user: any) => user.name;',
        'getName(first);',
        'getName(second);',
      ].join('\n'),
    },
    'const create = (user: any) => ({ name: user.name });',
    'const increment = (value: number) => value + 1;',
    'const normalize = (value: any) => parseValue(value.trim());',
    'const choose = (value: any) => (value ? first : second);',
    'function validate(value: any) { if (!value) throw new Error(); return value; }',
    'function outer() { const nested = (value: any) => parseValue(value); return nested; }',
    'const fetchUser = async (id: string) => getUser(id);',
    'function* gen(x: any) { return get(x); }',
    'const forward = (a: any, b: any) => target(b, a);',
    'const forward2 = (a: any) => target(a, 1);',
    'const forward3 = (a: any, b: any) => target(a);',
    'const getGlobal = (x: any) => config.name;',
    'const getName = (user: any) => user?.name;',
    'const callIt = (arg: any) => target?.(arg);',
    'const getWithExtraParam = (user: any, extra: any) => user.name;',
    'const getComputed = (user: any) => user[computedKey()];',
    'const noopStatement = (user: any) => { user.name; };',
  ],
})
