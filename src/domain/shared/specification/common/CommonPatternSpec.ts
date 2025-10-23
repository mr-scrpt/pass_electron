import { Validation, isTrue } from "@/shared/validation";
import { ISpecification } from "@/shared/specification";
import { ValidationError } from "@/shared/errors";

/**
 * Спецификация: проверка по регулярному выражению
 * 
 * Singleton Factory Pattern - экземпляры кэшируются по комбинации параметров
 */
export class CommonPatternSpec implements ISpecification<string> {
  // Кэш экземпляров по ключу "entityType:pattern:message"
  private static readonly _instances = new Map<string, CommonPatternSpec>();

  private constructor(
    private readonly entityType: string,
    private readonly pattern: RegExp,
    private readonly message: string,
  ) {}

  /**
   * Получить или создать экземпляр
   * @param entityType - тип сущности для сообщений об ошибках
   * @param pattern - регулярное выражение для проверки
   * @param message - сообщение об ошибке
   */
  static for(
    entityType: string,
    pattern: RegExp,
    message: string,
  ): CommonPatternSpec {
    const key = `${entityType}:${pattern.source}:${message}`;
    if (!CommonPatternSpec._instances.has(key)) {
      CommonPatternSpec._instances.set(
        key,
        new CommonPatternSpec(entityType, pattern, message)
      );
    }
    return CommonPatternSpec._instances.get(key)!;
  }

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return isTrue(this.pattern.test(value), value)
      .valid()
      .invalid(new ValidationError(this.entityType, this.message));
  }
}
