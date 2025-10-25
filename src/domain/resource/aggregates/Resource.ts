import { ResourceId, ResourceName, Namespace } from "../value-objects";
import type { Validation } from "@/shared/validation";
import { mergeInMany } from "@sweet-monads/either";
import type { ValidationError } from "@/shared/errors";

/**
 * Параметры для создания Resource
 * Используем именованные поля для предотвращения ошибок с порядком параметров
 */
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
   * Создание Resource с аккумуляцией ВСЕХ ошибок Value Objects
   * 
   * @param namespace - Validation<ValidationError[], Namespace>
   * @param name - Validation<ValidationError[], ResourceName>
   * @param secret - строка секрета
   * @returns Validation<ValidationError[], Resource> с ВСЕМИ ошибками или созданным Resource
   * 
   * @example
   * ```typescript
   * const result = Resource.create(
   *   Namespace.create(input.namespace),     // может быть Left(['error1', 'error2'])
   *   ResourceName.create(input.name),       // может быть Left(['error3'])
   *   input.secret
   * )
   * // => Left(['error1', 'error2', 'error3']) - ВСЕ ошибки!
   * // ИЛИ Right(Resource)
   * ```
   */
  static create(
    namespace: Validation<ValidationError[], Namespace>,
    name: Validation<ValidationError[], ResourceName>,
    secret: string,
  ): Validation<ValidationError[], Resource> {
    // Комбинируем ВСЕ ошибки через mergeInMany!
    return mergeInMany([namespace, name])
      .mapLeft((errorsArray) => errorsArray.flat())  // Flatten ValidationError[][] → ValidationError[]
      .map(([ns, nm]) =>
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
}
