import { Validation, ValidationCombinators } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";
import {
  CommonNotEmptySpec,
  CommonLengthSpec,
  CommonPatternSpec,
} from "../specification";

/**
 * Конфигурация для валидации строки
 */
export interface StringValidationConfig {
  entityType: string;
  minLength: number;
  maxLength: number;
  pattern?: RegExp;
  patternMessage?: string;
}

/**
 * Инвариант для валидации строк
 * 
 * Singleton паттерн - один экземпляр на всё приложение (stateless)
 * Следует паттерну IInvariant, но с гибкой конфигурацией
 * 
 * Используется для: Namespace, ResourceName и других строковых Value Objects
 */
export class StringInvariant {
  // Singleton instance
  private static readonly _instance = new StringInvariant();

  // Приватный конструктор
  private constructor() {}

  /**
   * Получить singleton instance
   */
  static get instance(): StringInvariant {
    return StringInvariant._instance;
  }

  /**
   * Валидация строки с произвольной конфигурацией
   * 
   * @param value - значение для валидации
   * @param config - конфигурация валидации (длина, паттерн)
   * @returns массив ValidationError[] или валидный string
   * 
   * ✅ Гибкая конфигурация под разные типы строк
   * ✅ Использует Singleton Factory для спецификаций
   */
  validate(
    value: string,
    config: StringValidationConfig,
  ): Validation<ValidationError[], string> {
    const specs = [
      CommonNotEmptySpec.for(config.entityType).isSatisfiedBy(value),
      CommonLengthSpec.for(
        config.entityType,
        config.minLength,
        config.maxLength,
      ).isSatisfiedBy(value),
    ];

    // Добавляем pattern проверку если указана
    if (config.pattern && config.patternMessage) {
      specs.push(
        CommonPatternSpec.for(
          config.entityType,
          config.pattern,
          config.patternMessage,
        ).isSatisfiedBy(value),
      );
    }

    return ValidationCombinators.sequence(specs, () => value);
  }

  /**
   * Удобный метод для простой валидации (без pattern)
   */
  validateLength(
    value: string,
    entityType: string,
    minLength: number,
    maxLength: number,
  ): Validation<ValidationError[], string> {
    return this.validate(value, {
      entityType,
      minLength,
      maxLength,
    });
  }
}
