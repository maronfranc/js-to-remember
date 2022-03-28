type Separator = '.';
/**
 * Receives a tuple of strings type and return a string of its joined values.
 * ```js
 * // Typescript type equivalent of:
 * strArr.join(separator)
 * ```
 * @example
 * type MyTuple = ['first', 'second', 'third'];
 * // MyTuple[0].MyTuple[1].MyTuple[2]
 * type MyJoinedTuple = JoinStringTuple<MyTuple>;
 * // No error
 * const str: MyJoinedTuple = 'first.second.third';
 */
type JoinStringTuple<T extends string[], JoinedString extends string = ''> =
  // Spread first array item `Item` and rest `...Rest`
  T extends [infer Item, ...infer Rest]
    // if `Item is string` and `Rest is string[]`
    ? Item extends string
      ? Rest extends string[]
        // Run recursively `JoinStringTuple(rest, str || `${previousStr}.${str}`)`
        ? JoinStringTuple<Rest, JoinedString extends '' ? Item : `${JoinedString}${Separator}${Item}`>
        : JoinedString
      : JoinedString
    : JoinedString;
