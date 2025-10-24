// src/domain/resource/value-objects/Namespace.ts
import { Validation } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";
import { NamespaceInvariant } from "../invariants";

/**
 * Value Object для namespace ресурса
 * Инвариант: 2-50 символов, lowercase, буквы/цифры/-/_
 */
export class Namespace {
  private static readonly ENTITY_TYPE = "Namespace";

  private constructor(private readonly _value: string) {}

  static create(value: string): Validation<ValidationError[], Namespace> {
    // ✅ Используем NamespaceInvariant (Singleton)
    // Правила валидации ВНУТРИ инварианта
    return NamespaceInvariant.instance
      .validate(value, Namespace.ENTITY_TYPE)
      .map((validValue: string) => new Namespace(validValue));
  }

  getValue(): string {
    return this._value;
  }

  equals(other: Namespace): boolean {
    return this._value === other._value;
  }
}
