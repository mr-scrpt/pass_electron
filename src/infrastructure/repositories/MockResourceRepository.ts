import type { IResourceRepository } from "@/domain";
import { Namespace, Resource, ResourceId } from "@/domain";
import type { IError } from "@/shared/errors";
import { NotFoundError } from "@/shared/errors";
import type { Validation } from "@/shared/validation";
import { fromCondition, fromNullable, valid } from "@/shared/validation";
import { mockResourcesData, type ResourceData } from "./mockData";

/**
 * Mock Repository - работает с простыми данными (DTO)
 * Преобразует DTO ↔ Domain при чтении/записи
 */
export class MockResourceRepository implements IResourceRepository {
  private storage: ResourceData[] = JSON.parse(
    JSON.stringify(mockResourcesData),
  ) as ResourceData[];

  async findAll(): Promise<Validation<IError[], Resource[]>> {
    await this.delay(100);
    return valid(this.storage.map((data) => this.toDomain(data)));
  }

  async findById(
    id: ResourceId,
  ): Promise<Validation<IError[], Resource>> {
    await this.delay(50);

    const data = this.storage.find((d) => d.id === id.getValue());
    
    return fromNullable(
      data,
      [new NotFoundError("Resource", id.getValue())]
    ).map(d => this.toDomain(d));
  }

  async findByNamespace(
    namespace: Namespace,
  ): Promise<Validation<IError[], Resource[]>> {
    await this.delay(50);

    const filtered = this.storage.filter(
      (d) => d.namespace === namespace.getValue(),
    );

    return valid(filtered.map((data) => this.toDomain(data)));
  }

  async search(query: string): Promise<Validation<IError[], Resource[]>> {
    await this.delay(100);

    const lowerQuery = query.toLowerCase();
    const filtered = this.storage.filter(
      (d) =>
        d.name.toLowerCase().includes(lowerQuery) ||
        d.namespace.toLowerCase().includes(lowerQuery),
    );

    return valid(filtered.map((data) => this.toDomain(data)));
  }

  async save(resource: Resource): Promise<Validation<IError[], Resource>> {
    await this.delay(150);

    const data = this.toData(resource);
    this.storage.push(data);

    return valid(resource);
  }

  async update(resource: Resource): Promise<Validation<IError[], Resource>> {
    await this.delay(150);

    const index = this.storage.findIndex(
      (d) => d.id === resource.id.getValue(),
    );

    return fromCondition(
      index !== -1,
      resource,
      [new NotFoundError("Resource", resource.id.getValue())],
    ).map((res) => {
      this.storage[index] = this.toData(res);
      return res;
    });
  }

  async delete(id: ResourceId): Promise<Validation<IError[], void>> {
    await this.delay(100);

    const index = this.storage.findIndex((d) => d.id === id.getValue());

    return fromCondition(
      index !== -1,
      undefined as void,
      [new NotFoundError("Resource", id.getValue())],
    ).map(() => {
      this.storage.splice(index, 1);
    });
  }

  /**
   * DTO → Domain (reconstitution без валидации)
   * Преобразует простые данные из хранилища в Domain объект
   */
  private toDomain(data: ResourceData): Resource {
    return Resource.reconstitute({
      id: data.id,
      namespace: data.namespace,
      name: data.name,
      secret: data.secret,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }

  /**
   * Domain → DTO
   * Преобразует Domain объект в простые данные для хранилища
   */
  private toData(resource: Resource): ResourceData {
    return {
      id: resource.id.getValue(),
      namespace: resource.namespace.getValue(),
      name: resource.name.getValue(),
      secret: resource.secret,
      createdAt: resource.createdAt.toISOString(),
      updatedAt: resource.updatedAt.toISOString(),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  reset(): void {
    this.storage = JSON.parse(
      JSON.stringify(mockResourcesData),
    ) as ResourceData[];
  }

  getAll(): ResourceData[] {
    return [...this.storage];
  }

  count(): number {
    return this.storage.length;
  }
}
