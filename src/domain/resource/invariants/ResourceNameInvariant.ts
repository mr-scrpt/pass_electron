import { Validation, ValidationCombinators } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";
import { CommonNotEmptySpec, CommonLengthSpec } from "@/domain/shared/specification";
import { IInvariant } from "@/domain/shared/invariants";

/**
 * Инвариант для валидации ResourceName
 * 
 * Правила:
 * - 1-100 символов
 * 
 * Реализует IInvariant<string>
 * Singleton паттерн - один экземпляр на всё приложение (stateless)
 */
export class ResourceNameInvariant implements IInvariant<string> {
  // Правила валидации ВНУТРИ инварианта
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 100;

  // Singleton instance
  private static readonly _instance = new ResourceNameInvariant();

  // Приватный конструктор
  private constructor() {}

  /**
   * Получить singleton instance
   */
  static get instance(): ResourceNameInvariant {
    return ResourceNameInvariant._instance;
  }

  /**
   * Валидация resource name через спецификации
   * Накапливает ВСЕ ошибки (пустота + длина)
   * 
   * @param value - значение для валидации
   * @param entityType - тип сущности (обычно "ResourceName")
   * @returns массив ValidationError[] или валидный string
   */
  validate(
    value: string,
    entityType: string,
  ): Validation<ValidationError[], string> {
    // Используем именованные параметры для спецификаций
    return ValidationCombinators.sequence(
      [
        CommonNotEmptySpec.for({ entityType }).isSatisfiedBy(value),
        CommonLengthSpec.for({
          entityType,
          minLength: ResourceNameInvariant.MIN_LENGTH,
          maxLength: ResourceNameInvariant.MAX_LENGTH,
        }).isSatisfiedBy(value),
      ],
      () => value,
    );
  }
}
