// src/domain/resource/aggregates/Resource.ts
import { ResourceId, ResourceName, Namespace } from "../value-objects";

/**
 * Resource Aggregate Root
 * Упрощенная версия для Шага 1 (только чтение)
 * 
 * В полной версии будет:
 * - Фабричный метод create() с валидацией
 * - Бизнес-методы (rename, lock, addCustomField)
 * - Domain Events
 * - CustomField entities
 */
export class Resource {
  constructor(
    public readonly id: ResourceId,
    public readonly namespace: Namespace,
    public readonly name: ResourceName,
    public readonly secret: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Генерирует новый Resource (упрощенная версия)
   */
  static generate(
    namespace: Namespace,
    name: ResourceName,
    secret: string,
  ): Resource {
    return new Resource(
      ResourceId.generate(),
      namespace,
      name,
      secret,
      new Date(),
      new Date(),
    );
  }
}
