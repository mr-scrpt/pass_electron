# Domain Layer - Практическое руководство

Создание Value Objects, Aggregates и Repository интерфейсов.

> **Назад:** [BASE_HANDLERS_SETUP.md](./BASE_HANDLERS_SETUP.md)  
> **Далее:** [APPLICATION_LAYER_PIPELINE.md](./APPLICATION_LAYER_PIPELINE.md)

---

## 🎯 Цель

Создать Domain Layer с Value Objects, Aggregates и Repository интерфейсами на основе реального кода проекта.

---

## 📦 Структура

```
src/domain/resource/
├── value-objects/
│   ├── ResourceId.ts
│   ├── Namespace.ts
│   └── ResourceName.ts
├── aggregates/
│   └── Resource.ts
├── repositories/
│   └── IResourceRepository.ts
└── index.ts  # Public API
```

---

## 1. ResourceId Value Object

**Файл: `src/domain/resource/value-objects/ResourceId.ts`**

```typescript
import { v4 as uuidv4 } from 'uuid';
import type { Validation } from '@/shared/validation';
import { valid, invalid } from '@/shared/validation';
import { ValidationError } from '@/shared/errors';

export class ResourceId {
  private constructor(private readonly _value: string) {}

  static create(value: string): Validation<ValidationError[], ResourceId> {
    // Простая валидация UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(value)) {
      return invalid([
        new ValidationError('ResourceId', ['Invalid UUID format'], { value })
      ]);
    }

    return valid(new ResourceId(value));
  }

  static generate(): ResourceId {
    return new ResourceId(uuidv4());
  }

  getValue(): string {
    return this._value;
  }

  equals(other: ResourceId): boolean {
    return this._value === other._value;
  }
}
```

---

## 2. Namespace Value Object

**Файл: `src/domain/resource/value-objects/Namespace.ts`**

```typescript
import type { Validation } from '@/shared/validation';
import { valid, invalid } from '@/shared/validation';
import { ValidationError } from '@/shared/errors';

export class Namespace {
  private constructor(private readonly _value: string) {}

  static create(value: string): Validation<ValidationError[], Namespace> {
    const errors: string[] = [];

    // Проверка: не пустое
    if (!value || value.trim().length === 0) {
      errors.push('Namespace cannot be empty');
    }

    // Проверка: длина 2-50 символов
    if (value.length < 2 || value.length > 50) {
      errors.push('Namespace must be between 2 and 50 characters');
    }

    // Проверка: только lowercase буквы, цифры, дефис, подчеркивание
    if (!/^[a-z0-9-_]+$/.test(value)) {
      errors.push('Namespace must contain only lowercase letters, numbers, hyphens, and underscores');
    }

    if (errors.length > 0) {
      return invalid([
        new ValidationError('Namespace', errors, { value })
      ]);
    }

    return valid(new Namespace(value));
  }

  getValue(): string {
    return this._value;
  }

  equals(other: Namespace): boolean {
    return this._value === other._value;
  }
}
```

---

## 3. ResourceName Value Object

**Файл: `src/domain/resource/value-objects/ResourceName.ts`**

```typescript
import type { Validation } from '@/shared/validation';
import { valid, invalid } from '@/shared/validation';
import { ValidationError } from '@/shared/errors';

export class ResourceName {
  private constructor(private readonly _value: string) {}

  static create(value: string): Validation<ValidationError[], ResourceName> {
    const errors: string[] = [];

    // Проверка: не пустое
    if (!value || value.trim().length === 0) {
      errors.push('Resource name cannot be empty');
    }

    // Проверка: длина 2-100 символов
    if (value.length < 2 || value.length > 100) {
      errors.push('Resource name must be between 2 and 100 characters');
    }

    // Проверка: только буквы, цифры, пробелы, дефис, подчеркивание
    if (!/^[a-zA-Z0-9\s-_]+$/.test(value)) {
      errors.push('Resource name must contain only letters, numbers, spaces, hyphens, and underscores');
    }

    if (errors.length > 0) {
      return invalid([
        new ValidationError('ResourceName', errors, { value })
      ]);
    }

    return valid(new ResourceName(value));
  }

  getValue(): string {
    return this._value;
  }

  equals(other: ResourceName): boolean {
    return this._value === other._value;
  }
}
```

---

## 4. Resource Aggregate

**Файл: `src/domain/resource/aggregates/Resource.ts`**

```typescript
import { ResourceId, ResourceName, Namespace } from "../value-objects";
import type { Validation } from "@/shared/validation";
import { mergeInMany } from "@sweet-monads/either";
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
   * Создание Resource с аккумуляцией ВСЕХ ошибок Value Objects
   * 
   * mergeInMany накапливает ВСЕ ошибки валидации!
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
```

---

## 5. IResourceRepository Interface

**Файл: `src/domain/resource/repositories/IResourceRepository.ts`**

```typescript
import type { Validation } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import type { Namespace, ResourceId } from "../value-objects";
import type { Resource } from "../aggregates";

/**
 * Repository интерфейс (Domain Layer)
 * Реализация в Infrastructure Layer
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
```

---

## 6. Public API для Domain

**Файл: `src/domain/resource/value-objects/index.ts`**

```typescript
export { ResourceId } from './ResourceId';
export { Namespace } from './Namespace';
export { ResourceName } from './ResourceName';
```

**Файл: `src/domain/resource/aggregates/index.ts`**

```typescript
export { Resource } from './Resource';
```

**Файл: `src/domain/resource/repositories/index.ts`**

```typescript
export type { IResourceRepository } from './IResourceRepository';
```

**Файл: `src/domain/resource/index.ts`**

```typescript
export { ResourceId, Namespace, ResourceName } from './value-objects';
export { Resource } from './aggregates';
export type { IResourceRepository } from './repositories';
```

**Файл: `src/domain/index.ts`**

```typescript
export {
  Resource,
  ResourceId,
  Namespace,
  ResourceName,
  type IResourceRepository,
} from './resource';
```

---

## ✅ Проверка

```bash
# Установить uuid если еще не установлен
pnpm add uuid
pnpm add -D @types/uuid

# Компиляция
pnpm tsc --noEmit
```

---

## 🎯 Примеры использования

### Создание Resource с аккумуляцией ошибок

```typescript
// ✅ Все ошибки накапливаются!
const result = Resource.create(
  Namespace.create('a'),        // ❌ Too short
  ResourceName.create('b'),     // ❌ Too short
  'secret123'
);

// result будет Left(['Namespace must be between 2 and 50 characters', 'Resource name must be between 2 and 100 characters'])
// Обе ошибки! Не только первая!
```

### Успешное создание

```typescript
const result = Resource.create(
  Namespace.create('social'),
  ResourceName.create('Facebook'),
  'my-secret-password'
);

// result будет Right(Resource)
result.map(resource => {
  console.log(resource.id.getValue());        // UUID
  console.log(resource.namespace.getValue()); // 'social'
  console.log(resource.name.getValue());      // 'Facebook'
});
```

---

## 📚 См. также

- [../../docs/error-handling/INVARIANTS.md](../../docs/error-handling/INVARIANTS.md) - валидация в DDD
- [../../docs/DDD_AND_CLEAN_ARCHITECTURE.md](../../docs/DDD_AND_CLEAN_ARCHITECTURE.md) - DDD паттерны

---

**Следующий шаг:** [APPLICATION_LAYER_PIPELINE.md](./APPLICATION_LAYER_PIPELINE.md) - создание Handlers с Pipeline
