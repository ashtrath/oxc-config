/**
 * A type that can be awaited: Promise<T> or T.
 */
export type Awaitable<T> = T | Promise<T>

/**
 * Omit any index signatures from the given object type, leaving only explicitly defined properties.
 */
export type OmitIndexSignature<ObjectType> = {
  [
    KeyType in keyof ObjectType as object extends Record<KeyType, unknown> ? never : KeyType
  ]: ObjectType[KeyType]
}

/**
 * Flatten the type output to improve type hints shown in editors.
 */
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {}
