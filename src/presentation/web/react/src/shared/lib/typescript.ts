// shared/lib/enum.helper.ts
// export function createEnum<T extends readonly string[]>(
//   values: T,
// ): Record<T[number], T[number]> {
//   return Object.fromEntries(values.map((v) => [v, v])) as Record<
//     T[number],
//     T[number]
//   >;
// }
export function createDict<T extends readonly string[]>(values: T) {
  return Object.fromEntries(values.map((v) => [v, v])) as {
    [K in T[number]]: K;
  };
}
