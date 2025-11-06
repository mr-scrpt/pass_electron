/**
 * Phantom type для брендирования значений
 * Делает типы номинальными вместо структурных
 */
declare const __brand: unique symbol;
type Brand<T, TBrand extends string> = T & { [__brand]: TBrand };

/**
 * Создает объект-словарь из массива строк
 * Каждый элемент массива становится ключом и значением
 * 
 * @example
 * ```typescript
 * const SIZES = ["S", "M", "L"] as const;
 * const dict = createDict(SIZES);
 * // { S: "S", M: "M", L: "L" }
 * ```
 */
export function createDict<T extends readonly string[]>(values: T) {
  return Object.fromEntries(values.map((v) => [v, v])) as {
    [K in T[number]]: K;
  };
}

/**
 * Создает branded объект-словарь из массива строк
 * Значения становятся номинально типизированными и НЕ совместимы со строками
 * 
 * На runtime это просто строки, но TypeScript запретит передачу строковых литералов
 * 
 * @example
 * ```typescript
 * const SIZES = ["S", "M", "L"] as const;
 * const SIZE = createBrandedDict(SIZES, "Size");
 * type SizeType = typeof SIZE[keyof typeof SIZE];
 * 
 * // ✅ РАБОТАЕТ
 * const size: SizeType = SIZE.M;
 * 
 * // ❌ ОШИБКА: Type '"M"' is not assignable to type 'SizeType'
 * const size: SizeType = "M";
 * ```
 */
export function createBrandedDict<
  T extends readonly string[],
  TBrand extends string
>(arr: T, brand: TBrand) {
  const result = {} as any;
  arr.forEach((key) => {
    result[key] = key;
  });
  return result as {
    [K in T[number]]: Brand<K, TBrand>;
  };
}

/**
 * Генерирует compound массив из комбинаций view × state
 * 
 * @example
 * ```typescript
 * const VIEWS = ["PRIMARY", "SECONDARY"] as const;
 * const STATES = ["IDLE", "ERROR"] as const;
 * const compound = generateCompoundArray(VIEWS, STATES);
 * // ["PRIMARY_IDLE", "PRIMARY_ERROR", "SECONDARY_IDLE", "SECONDARY_ERROR"] as const
 * ```
 */
export function generateCompoundArray<
  TView extends readonly string[],
  TState extends readonly string[]
>(
  views: TView,
  states: TState
): readonly `${TView[number]}_${TState[number]}`[] {
  const result: string[] = [];
  views.forEach((view) => {
    states.forEach((state) => {
      result.push(`${view}_${state}`);
    });
  });
  return result as readonly `${TView[number]}_${TState[number]}`[];
}

/**
 * Извлекает ключи из enum (только для числовых enum)
 * @deprecated Используйте массивы вместо enum для лучшей type-safety
 */
export function getEnumKeys<T extends object>(enumObj: T): (keyof T)[] {
  return Object.keys(enumObj).filter((k) => isNaN(Number(k))) as (keyof T)[];
}

/**
 * Utility type для гарантии покрытия всех вариантов из union type
 * 
 * Работает с типами выведенными из массивов: `(typeof ARRAY)[number]`
 * TypeScript проверит что объект содержит ВСЕ ключи из union
 * 
 * @example
 * ```typescript
 * const INPUT_SIZE = ["S", "M", "L", "XL"] as const;
 * type InputSize = (typeof INPUT_SIZE)[number]; // "S" | "M" | "L" | "XL"
 * 
 * const config = {
 *   S: ["h-6"],
 *   M: ["h-8"],
 *   L: ["h-9"],
 *   XL: ["h-10"],
 * } satisfies EnsureAllKeys<InputSize, string[]>;
 * 
 * // Если удалить любой ключ (например XL) - TypeScript выдаст ошибку компиляции!
 * ```
 */
export type EnsureAllKeys<TUnion extends string, TValue> = {
  [K in TUnion]: TValue;
};
