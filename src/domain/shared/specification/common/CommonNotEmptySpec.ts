import { Validation, isTrue } from "@/shared/validation";
import { ISpecification } from "@/shared/specification";
import { ValidationError } from "@/shared/errors";

/**
 * Спецификация: проверка на пустую строку
 * 
 * Singleton Factory Pattern - экземпляры кэшируются по entityType
 */
export class CommonNotEmptySpec implements ISpecification<string> {
  // Кэш экземпляров по entityType
  private static readonly _instances = new Map<string, CommonNotEmptySpec>();

  private constructor(private readonly entityType: string) {}

  /**
   * Получить или создать экземпляр для entityType
   * @param entityType - тип сущности для сообщений об ошибках
   */
  static for(entityType: string): CommonNotEmptySpec {
    if (!CommonNotEmptySpec._instances.has(entityType)) {
      CommonNotEmptySpec._instances.set(
        entityType,
        new CommonNotEmptySpec(entityType)
      );
    }
    return CommonNotEmptySpec._instances.get(entityType)!;
  }

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return isTrue(!!(value && value.trim().length > 0), value)
      .valid()
      .invalid(new ValidationError(this.entityType, "cannot be empty"));
  }
}
