import type { VariantMatcher, MatcherConfig } from './types';

/**
 * ДЕКЛАРАТИВНАЯ функция проверки совпадения
 * Сравнивает pattern с actual через Object.entries
 * НЕТ if'ов - только every()
 */
function matches<T extends Record<string, any>>(
  pattern: Partial<T>,
  actual: T
): boolean {
  return Object.entries(pattern).every(([key, value]) => actual[key] === value);
}

/**
 * Вычисляет приоритет варианта
 * Приоритет = количество условий в match
 * Больше условий = выше специфичность = выше приоритет
 */
function calculatePriority<T>(variant: VariantMatcher<T, any>): number {
  return Object.keys(variant.match).length;
}

/**
 * УНИВЕРСАЛЬНЫЙ резолвер для любого компонента
 * 
 * Алгоритм:
 * 1. Вычисляем приоритеты для всех вариантов
 * 2. Сортируем по убыванию приоритета (более специфичные первыми)
 * 3. Находим первый подходящий вариант через find + matches
 * 4. Возвращаем result или fallback
 * 
 * НЕТ if'ов - только find, sort, map
 */
export function resolveVariant<TParams extends Record<string, any>, TResult>(
  config: MatcherConfig<TParams, TResult>,
  params: TParams
): TResult {
  // Сортируем варианты по убыванию приоритета (более специфичные первыми)
  const sortedVariants = [...config.variants]
    .map(variant => ({
      ...variant,
      priority: variant.priority ?? calculatePriority(variant),
    }))
    .sort((a, b) => b.priority - a.priority);

  // Находим первый подходящий вариант
  const matched = sortedVariants.find(variant => matches(variant.match, params));

  return matched?.result ?? config.fallback;
}
