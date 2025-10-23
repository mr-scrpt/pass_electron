import { Validation, isTrue } from "@/shared/validation";
import { ISpecification } from "@/shared/specification";
import { ValidationError } from "@/shared/errors";

/**
 * Спецификация: проверка диапазона длины строки
 * 
 * Singleton Factory Pattern - экземпляры кэшируются по комбинации параметров
 */
export class CommonLengthSpec implements ISpecification<string> {
  // Кэш экземпляров по ключу "entityType:min:max"
  private static readonly _instances = new Map<string, CommonLengthSpec>();

  private constructor(
    private readonly entityType: string,
    private readonly minLength: number,
    private readonly maxLength: number,
  ) {}

  /**
   * Получить или создать экземпляр
   * @param entityType - тип сущности для сообщений об ошибках
   * @param minLength - минимальная длина
   * @param maxLength - максимальная длина
   */
  static for(
    entityType: string,
    minLength: number,
    maxLength: number,
  ): CommonLengthSpec {
    const key = `${entityType}:${minLength}:${maxLength}`;
    if (!CommonLengthSpec._instances.has(key)) {
      CommonLengthSpec._instances.set(
        key,
        new CommonLengthSpec(entityType, minLength, maxLength)
      );
    }
    return CommonLengthSpec._instances.get(key)!;
  }

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return isTrue(
      value.length >= this.minLength && value.length <= this.maxLength,
      value,
    )
      .valid()
      .invalid(
        new ValidationError(
          this.entityType,
          `must be ${this.minLength}-${this.maxLength} characters`,
        ),
      );
  }
}
