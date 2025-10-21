//  src/domain/resource/repositories/IResourceRepository.ts
import type { Namespace, ResourceId } from "../value-objects";
import type { Resource } from "../aggregates";

/**
 * Интерфейс репозитория ресурсов
 * Определен в Domain Layer, реализован в Infrastructure Layer
 *
 * ⚠️ Возвращает Domain типы (Resource), НЕ DTO!
 * Преобразование Domain → DTO происходит в Query Handler (Application Layer)
 */
export interface IResourceRepository {
  findAll(): Promise<Resource[]>;
  findById(id: ResourceId): Promise<Resource | null>;
  findByNamespace(namespace: Namespace): Promise<Resource[]>;
  search(query: string): Promise<Resource[]>;
}
