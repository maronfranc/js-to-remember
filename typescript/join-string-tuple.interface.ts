type Separator = '.';
/**
 * Receives a tuple of strings type and return a string of its joined values.
 * ```js 
 * // Typescript type equivalent of:
 * strArr.join(separator)
 * ```
 * @example
 * type MyTuple = ['first', 'second', 'third'];
 * type MyJoinedTuple = JoinStringTuple<MyTuple>; // first.second.third
 * const str: MyJoinedTuple = 'first.second.third'; // No error
 */
type JoinStringTuple<T extends string[], JoinedString extends string = ''> =
  // Spread first array item `I` and rest `...R`
  T extends [infer I, ...infer R] ?
  // if `I is string` and `R is string[]`
  I extends string ? R extends string[]
  // Run recursively `JoinStringTuple(rest, str || `${previousStr}.${str}`)`
  ? JoinStringTuple<R, JoinedString extends '' ? I : `${JoinedString}${Separator}${I}`>
  // else
  : JoinedString
  : JoinedString
  : JoinedString;
