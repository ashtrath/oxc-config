import { RuleTester } from 'oxlint/plugins-dev'

import { noStaticOnlyClass } from './no-static-only-class'

const ruleTester = new RuleTester()
const error = { messageId: 'staticOnly' }

ruleTester.run('no-static-only-class', noStaticOnlyClass, {
  invalid: [
    {
      name: 'reports classes that group only static members',
      errors: [error],
      code: `class StringUtils {
        static capitalize(value: string) { return value }
        static BASE = 10
      }`,
    },
    {
      name: 'reports static-only class expression',
      code: 'const Util = class { static run() {} };',
      errors: [error],
    },
    {
      name: 'reports export default anonymous class',
      code: 'export default class { static run() {} };',
      errors: [error],
    },
    {
      name: 'reports class with empty boilerplate constructor',
      errors: [error],
      code: `class Util {
        constructor() {}
        static run() {}
      }`,
    },
    {
      name: 'reports class with private empty constructor',
      errors: [error],
      code: `class Util {
        private constructor() {}
        static run() {}
      }`,
    },
    {
      name: 'reports class with private throw constructor',
      errors: [error],
      code: `class Util {
        private constructor() {
          throw new Error('Static class')
        }
        static run() {}
      }`,
    },
    {
      name: 'reports class with static property and static block',
      errors: [error],
      code: `class Registry {
        static map = new Map()
        static { Registry.map.set('a', 1) }
      }`,
    },
  ],
  valid: [
    'class Empty {}',
    'class OnlyConstructor { constructor() {} }',
    'class OnlyPrivateConstructor { private constructor() {} }',
    `class Counter {
      count = 0
      static create() { return new Counter() }
      increment() { this.count++ }
    }`,
    'class Child extends Base { static run() {} }',
    'class Impl implements IFace { static run() {} }',
    'declare class Ambient { static run(): void }',
    'export declare class AmbientExport { static run(): void }',
    `declare namespace NS {
      class AmbientInNamespace { static run(): void }
    }`,
    `declare module 'mod' {
      class AmbientInModule { static run(): void }
    }`,
    'abstract class Abs { static run() {} }',
    `@Injectable()
    class Service { static run() {} }`,
    `class MemberDecorated {
      @Track()
      static run() {}
    }`,
    `class WithParamProperty {
      constructor(private config: any) {}
      static create() {}
    }`,
    `class WithConstructorParam {
      constructor(x: number) {}
      static create() {}
    }`,
  ],
})
