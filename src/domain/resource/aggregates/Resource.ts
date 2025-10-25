import { ResourceId, ResourceName, Namespace } from "../value-objects";
import type { Validation } from "@/shared/validation";
import { ValidationCombinators } from "@/shared/validation";
import type { ValidationError } from "@/shared/errors";

interface ResourceProps {
  readonly id: ResourceId;
  readonly namespace: Namespace;
  readonly name: ResourceName;
  readonly secret: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Resource {
  public readonly id: ResourceId;
  public readonly namespace: Namespace;
  public readonly name: ResourceName;
  public readonly secret: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: ResourceProps) {
    this.id = props.id;
    this.namespace = props.namespace;
    this.name = props.name;
    this.secret = props.secret;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Создание нового Resource с валидацией
   * Используется в Command Handlers для создания новых ресурсов
   */
  static create(
    namespace: Validation<ValidationError[], Namespace>,
    name: Validation<ValidationError[], ResourceName>,
    secret: string,
  ): Validation<ValidationError[], Resource> {
    return ValidationCombinators.combine(namespace, name).map(
      ([ns, nm]) =>
        new Resource({
          id: ResourceId.generate(),
          namespace: ns,
          name: nm,
          secret,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
    );
  }

  /**
   * Восстановление Resource из хранилища БЕЗ валидации
   * Используется в Repository для reconstitution из БД
   * 
   * ⚠️ Предполагается что данные уже валидны (прошли валидацию при создании)
   */
  static reconstitute(data: {
    id: string;
    namespace: string;
    name: string;
    secret: string;
    createdAt: Date;
    updatedAt: Date;
  }): Resource {
    return new Resource({
      id: ResourceId.reconstitute(data.id),
      namespace: Namespace.reconstitute(data.namespace),
      name: ResourceName.reconstitute(data.name),
      secret: data.secret,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
