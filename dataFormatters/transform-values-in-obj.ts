import { NestedKeyOf } from '../typescript/nested-key-of.interface';

function isFunction(possibleFunction: unknown): possibleFunction is CallableFunction {
  return typeof possibleFunction === 'function' && possibleFunction !== null;
}

export function transformValuesInObj<T extends Record<string, any>, K extends string & NestedKeyOf<T>>(
  mutableObj: T,
  nestedKeys: K[],
  valueOrTransformer: T[K] | CallableFunction,
): void {
  nestedKeys.forEach((nestedKey) => {
    transformSingleValueInObj(mutableObj, nestedKey, valueOrTransformer);
  });
}

function transformSingleValueInObj<T extends Record<string, any>, K extends string & NestedKeyOf<T>>(
  mutableObj: T,
  paths: K,
  valueOrTransformer: T[K] | CallableFunction,
) {
  if (!paths.includes('.')) {
    mutableObj[paths] = isFunction(valueOrTransformer)
      ? valueOrTransformer(mutableObj[paths])
      : valueOrTransformer;
    return;
  }

  const [firstPath, ...rest] = paths.split('.') as [keyof T, ...T[K][]];
  const nestedObj = mutableObj[firstPath] as T[K];

  if (Array.isArray(nestedObj)) {
    nestedObj.forEach((arrayItem: T[K]) => {
      transformValuesInObj(arrayItem, rest, valueOrTransformer);
    });
    return;
  }

  return transformValuesInObj(nestedObj, rest, valueOrTransformer);
}

/* JEST TEST
describe(transformValuesInObj.name, () => {
  it('should mutate obj transforming value in obj', async () => {
    const idBefore = 'object-name';
    const nestedIdBefore = `nested-${idBefore}`;
    const itemIdValue = `item-${idBefore}`;
    const arrayItemIds = [0, 1].map(index => `${itemIdValue}-${index}`);

    const objToMutate = {
      id: idBefore,
      nested: { id: nestedIdBefore },
      items: [{ id: arrayItemIds[0] }, { id: arrayItemIds[1] }],
    };

    const transformFunction = (value: string) => `transformed-${value}`;

    const idAfter = transformFunction(objToMutate.id);
    const nestedIdAfter = transformFunction(objToMutate.nested.id);
    const itemIdsAfter = arrayItemIds.map((id) => transformFunction(id));

    transformValuesInObj(objToMutate, ['id', 'nested.id', 'items.id'], transformFunction);

    expect(objToMutate.id).toBe(idAfter);
    expect(objToMutate.nested.id).toBe(nestedIdAfter);
    expect(objToMutate.id).toStartWith('transformed');
    expect(objToMutate.nested.id).toStartWith('transformed');

    objToMutate.items.forEach((item, index) => {
      expect(item.id).toBe(itemIdsAfter[index]);
      expect(item.id).toStartWith('transformed');
    });
  });
});
*/