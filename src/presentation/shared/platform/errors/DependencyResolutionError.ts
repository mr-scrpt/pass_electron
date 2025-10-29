import { PlatformError } from './PlatformError';
import type { IError } from '@/main/shared/errors';

/**
 * Ошибка разрешения зависимости из DI контейнера
 * 
 * Возникает когда:
 * - ServiceContainer не инициализирован
 * - Зависимость не зарегистрирована
 * - Ошибка при создании зависимости
 */
export class DependencyResolutionError extends PlatformError {
  constructor(
    dependencyName: string,
    underlyingErrors: IError[]
  ) {
    super(
      'DependencyInjection',
      `Failed to resolve dependency: ${dependencyName}`,
      underlyingErrors,
      { dependencyName }
    );
    this.name = 'DependencyResolutionError';
  }
}
