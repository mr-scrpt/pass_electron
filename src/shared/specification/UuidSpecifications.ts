/**
 * UUID Specifications - спецификации для UUID
 * Singleton Factory Pattern - экземпляры кэшируются по entityType
 */

import type { Validation } from "@/shared/validation";
import { isTrue } from "@/shared/validation";
import type { ISpecification } from "./ISpecification";
import { BaseError } from "@/shared/errors";

/**
 * Проверка UUID v4
 */
export class UuidV4Spec implements ISpecification<string> {
  private static readonly UUID_V4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private static readonly _instances = new Map<string, UuidV4Spec>();

  private constructor(private readonly entityType: string) {}

  static for(entityType: string): UuidV4Spec {
    if (!UuidV4Spec._instances.has(entityType)) {
      UuidV4Spec._instances.set(entityType, new UuidV4Spec(entityType));
    }
    return UuidV4Spec._instances.get(entityType)!;
  }

  isSatisfiedBy(value: string): Validation<BaseError, string> {
    return isTrue(UuidV4Spec.UUID_V4_REGEX.test(value), value)
      .valid()
      .invalid(
          new BaseError({
            entityType: this.entityType,
            message: `Invalid UUID format: ${value}`,
            code: 'SPECIFICATION_VIOLATION',
          }),
        );
  }
}
