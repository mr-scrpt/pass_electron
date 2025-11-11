declare const __brand: unique symbol;
type Brand<T, TBrand extends string> = T & { [__brand]: TBrand };

export function createDict<T extends readonly string[]>(values: T) {
  return Object.fromEntries(values.map((v) => [v, v])) as {
    [K in T[number]]: K;
  };
}

export function createBrandedDict<
  T extends readonly string[],
  TBrand extends string,
>(arr: T, _brand: TBrand) {
  const result: Record<string, string> = {};
  arr.forEach((key) => {
    result[key] = key;
  });
  return result as {
    [K in T[number]]: Brand<K, TBrand>;
  };
}

export function generateCompoundArray<
  TElemMain extends readonly string[],
  TElemAdd extends readonly string[],
>(
  main: TElemMain,
  add: TElemAdd,
): readonly `${TElemMain[number]}_${TElemAdd[number]}`[] {
  const result: string[] = [];
  main.forEach((view) => {
    add.forEach((state) => {
      result.push(`${view}_${state}`);
    });
  });
  return result as readonly `${TElemMain[number]}_${TElemAdd[number]}`[];
}

export function getEnumKeys<T extends object>(enumObj: T): (keyof T)[] {
  return Object.keys(enumObj).filter((k) => isNaN(Number(k))) as (keyof T)[];
}

export type EnsureAllKeys<TUnion extends string, TValue> = {
  [K in TUnion]: TValue;
};
