/**
 * A type that can be awaited: Promise<T> or T.
 */
export type Awaitable<T> = T | Promise<T>

/**
 * A type that can be a single item or an array of items.
 */
export type Arrayable<T> = T | T[]

/**
 * Loose autocomplete for string literal unions. Preserves literal suggestions in IDEs without
 * collapsing into `string`.
 */
export type StringLiteralUnion<T extends U, U = string> = T | (U & Record<never, never>)

/**
 * Resolves a boolean flag to an empty object, or extracts the non-boolean options type.
 */
export type ResolvedOptions<T> = T extends boolean ? Record<string, never> : NonNullable<T>

/**
 * Makes all properties of an object nullable or undefined.
 */
export type NullableObject<T> = {
  [K in keyof T]?: T[K] | null | undefined
}

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
