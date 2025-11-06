/**
 * Универсальный тип для матчинга вариантов
 * Используется для декларативного описания комбинаций параметров
 */
export type VariantMatcher<TParams, TResult> = {
  /**
   * Условие совпадения (декларативное описание)
   * Частичный объект параметров для проверки
   */
  match: Partial<TParams>;

  /**
   * Результат если вариант совпал
   */
  result: TResult;

  /**
   * Приоритет варианта (вычисляется автоматически если не указан)
   * Больше = выше приоритет (более специфичный вариант)
   */
  priority?: number;
};

/**
 * Конфигурация matcher'а
 */
export type MatcherConfig<TParams, TResult> = {
  /**
   * Массив вариантов для проверки
   */
  variants: Array<VariantMatcher<TParams, TResult>>;

  /**
   * Fallback значение если ни один вариант не подошел
   */
  fallback: TResult;
};
