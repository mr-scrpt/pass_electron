import { Validation, isTrue } from "@/shared/validation";
import { ISpecification } from "@/shared/specification";
import { BaseError } from "@/shared/errors";

/**
 * Конфигурация для проверки на пустоту
 */
export interface NotEmptyConfig {
  readonly entityType: string;
}

/**
 * Спецификация: проверка что строка не пуста
 *
 * Singleton Factory Pattern - экземпляры кэшируются по entityType
 * Использует именованные параметры для консистентности с другими спецификациями
 */
export class CommonNotEmptySpec implements ISpecification<string> {
  // Flyweight: кэш экземпляров по entityType
  private static readonly _instances = new Map<string, CommonNotEmptySpec>();

  private constructor(private readonly config: NotEmptyConfig) {}

  /**
   * Получить или создать экземпляр
   * @param config - конфигурация с именованными параметрами
   */
  static for(config: NotEmptyConfig): CommonNotEmptySpec {
    const key = config.entityType;
    
    if (!CommonNotEmptySpec._instances.has(key)) {
      CommonNotEmptySpec._instances.set(key, new CommonNotEmptySpec(config));
    }
    
    return CommonNotEmptySpec._instances.get(key)!;
  }

  isSatisfiedBy(value: string): Validation<BaseError, string> {
    return isTrue(Boolean(value && value.trim().length > 0), value)
      .valid()
      .invalid(new BaseError(this.config.entityType, "cannot be empty"));
  }
}
