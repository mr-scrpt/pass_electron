import { Validation, ValidationCombinators } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";
import {
  CommonNotEmptySpec,
  CommonLengthSpec,
  CommonPatternSpec,
} from "@/domain/shared/specification";
import { IInvariant } from "@/domain/shared/invariants";

/**
 * Инвариант для валидации Namespace
 * 
 * Правила:
 * - 2-50 символов
 * - lowercase
 * - буквы, цифры, дефис, подчеркивание
 * 
 * Реализует IInvariant<string>
 * Singleton паттерн - один экземпляр на всё приложение (stateless)
 */
export class NamespaceInvariant implements IInvariant<string> {
  // Правила валидации ВНУТРИ инварианта
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 50;
  private static readonly PATTERN = /^[a-z0-9-_]+$/;
  private static readonly PATTERN_MESSAGE =
    "must contain only lowercase letters, numbers, - and _";

  // Singleton instance
  private static readonly _instance = new NamespaceInvariant();

  // Приватный конструктор
  private constructor() {}

  /**
   * Получить singleton instance
   */
  static get instance(): NamespaceInvariant {
    return NamespaceInvariant._instance;
  }

  /**
   * Валидация namespace через спецификации
   * Накапливает ВСЕ ошибки (пустота + длина + формат)
   * 
   * @param value - значение для валидации
   * @param entityType - тип сущности (обычно "Namespace")
   * @returns массив ValidationError[] или валидный string
   */
  validate(
    value: string,
    entityType: string,
  ): Validation<ValidationError[], string> {
    // Используем Singleton Factory для спецификаций
    return ValidationCombinators.sequence(
      [
        CommonNotEmptySpec.for(entityType).isSatisfiedBy(value),
        CommonLengthSpec.for(
          entityType,
          NamespaceInvariant.MIN_LENGTH,
          NamespaceInvariant.MAX_LENGTH,
        ).isSatisfiedBy(value),
        CommonPatternSpec.for(
          entityType,
          NamespaceInvariant.PATTERN,
          NamespaceInvariant.PATTERN_MESSAGE,
        ).isSatisfiedBy(value),
      ],
      () => value,
    );
  }
}
