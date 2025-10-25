//  src/domain/resource/repositories/IResourceRepository.ts
import type { Validation } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import type { Namespace, ResourceId } from "../value-objects";
import type { Resource } from "../aggregates";

/**
 * Интерфейс репозитория ресурсов (v2.0 - IError)
 * Определен в Domain Layer, реализован в Infrastructure Layer
 *
 * ⚠️ Возвращает Validation<IError[], T> для type-safe обработки ошибок
 * ⚠️ Возвращает Domain типы (Resource), НЕ DTO!
 * Преобразование Domain → DTO происходит в Query Handler (Application Layer)
 */
export interface IResourceRepository {
  findAll(): Promise<Validation<IError[], Resource[]>>;
  findById(id: ResourceId): Promise<Validation<IError[], Resource | null>>;
  findByNamespace(namespace: Namespace): Promise<Validation<IError[], Resource[]>>;
  search(query: string): Promise<Validation<IError[], Resource[]>>;
  save(resource: Resource): Promise<Validation<IError[], Resource>>;
  update(resource: Resource): Promise<Validation<IError[], Resource>>;
  delete(id: ResourceId): Promise<Validation<IError[], void>>;
}
