import type { Validation } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";
import { ResourceNameInvariant } from "../invariants";

export class ResourceName {
  private static readonly ENTITY_TYPE = "ResourceName";

  private constructor(private readonly _value: string) {}

  /**
   * Создание ResourceName с валидацией
   * Используется при обработке пользовательского ввода
   */
  static create(value: string): Validation<ValidationError[], ResourceName> {
    return ResourceNameInvariant.instance
      .validate(value, ResourceName.ENTITY_TYPE)
      .map((validValue: string) => new ResourceName(validValue));
  }

  /**
   * Восстановление ResourceName из хранилища БЕЗ валидации
   * Используется в Repository для reconstitution из БД
   * 
   * ⚠️ Предполагается что значение уже валидно
   */
  static reconstitute(value: string): ResourceName {
    return new ResourceName(value);
  }

  getValue(): string {
    return this._value;
  }

  equals(other: ResourceName): boolean {
    return this._value === other._value;
  }
}
