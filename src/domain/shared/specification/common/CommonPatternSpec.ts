import { Validation, isTrue } from "@/shared/validation";
import { ISpecification } from "@/shared/specification";
import { ValidationError } from "@/shared/errors";

/**
 * Конфигурация для проверки паттерна
 */
export interface PatternConfig {
  readonly entityType: string;
  readonly pattern: RegExp;
  readonly message: string;
}

/**
 * Спецификация: проверка по регулярному выражению
 * 
 * Singleton Factory Pattern - экземпляры кэшируются по комбинации параметров
 * Использует именованные параметры для предотвращения ошибок
 */
export class CommonPatternSpec implements ISpecification<string> {
  // Flyweight: кэш экземпляров по ключу "entityType:pattern:message"
  private static readonly _instances = new Map<string, CommonPatternSpec>();

  private constructor(private readonly config: PatternConfig) {}

  /**
   * Получить или создать экземпляр
   * @param config - конфигурация с именованными параметрами
   */
  static for(config: PatternConfig): CommonPatternSpec {
    const key = `${config.entityType}:${config.pattern.source}:${config.message}`;
    
    if (!CommonPatternSpec._instances.has(key)) {
      CommonPatternSpec._instances.set(key, new CommonPatternSpec(config));
    }
    
    return CommonPatternSpec._instances.get(key)!;
  }

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return isTrue(this.config.pattern.test(value), value)
      .valid()
      .invalid(new ValidationError(this.config.entityType, this.config.message));
  }
}
