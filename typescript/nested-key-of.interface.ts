type Obj = Record<any, any>;
/** 
 * Receives object and return union of its strings.
 * @example
 * ```ts
 * const obj = {
 *  id: 'main id',
 *  nested: {
 *    id: 'second id',
 *    deepNested: {
 *      id: 'third id',
 *    }
 *  }
 *}
 * type Path = NestedKeyOf<typeof obj>;
 * // "id" | "nested" | "nested.id" | "nested.deepNested" | "nested.deepNested.id"
 * ```
 * @see https://dev.to/pffigueiredo/typescript-utility-keyof-nested-object-2pa3
 */
export type NestedKeyOf<ObjectType extends Obj> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends infer ObjectValue
    ? ObjectValue extends Obj
      ? `${Key}` | `${Key}.${NestedKeyOf<ObjectValue>}`
      : `${Key}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];
