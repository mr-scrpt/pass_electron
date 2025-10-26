//  src/application/shared/BaseQueryHandler.ts
import type { IError } from "@/shared/errors";
import type { Validation } from "@/shared/validation";
import { tapLeft } from "@/shared/validation";
import type { ILogger } from "@/application/ports";

export abstract class BaseQueryHandler {
  protected readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Трансформация ошибок: unexpected → GenericApplicationError
   * Функциональный стиль БЕЗ if-ов и тернарников
   */
  protected transformInfrastructureErrors(errors: IError[]): IError[] {
    return errors.map(error => error.toUserError());
  }

  /**
   * Логирование ТОЛЬКО unexpected ошибок (Infrastructure errors)
   * Expected ошибки (Domain/Application) НЕ логируем - это нормальный flow
   */
  protected logInfrastructureErrors(
    operation: string,
  ): (errors: IError[]) => void {
    return (errors: IError[]) => {
      errors
        .filter(error => !error.isExpected())  // Только unexpected
        .forEach(error => {
          const level = error.getLogLevel();
          const logMethod = this.logger[level];
          logMethod.call(
            this.logger,
            `${operation}: ${error.getMessage()}`,
            error.getContext()
          );
        });
    };
  }

  /**
   * Логирование ошибок через tapLeft
   * Полиморфный подход БЕЗ проверок типов
   */
  protected logErrors(
    operation: string,
  ): (errors: IError[]) => void {
    return (errors: IError[]) => {
      errors.forEach(error => {
        const level = error.getLogLevel();
        const logMethod = this.logger[level];
        logMethod.call(
          this.logger,
          `${operation}: ${error.getMessage()}`,
          error.getContext()
        );
      });
    };
  }

  /**
   * Обработка Infrastructure errors (repository, external services)
   * - Логирует ТОЛЬКО unexpected ошибки
   * - Трансформирует ошибки через toUserError()
   */
  protected handleInfrastructureErrors<T>(
    result: Validation<IError[], T>,
    operation: string,
  ): Validation<IError[], T> {
    return tapLeft<IError[], T>(this.logInfrastructureErrors(operation))(result)
      .mapLeft(errors => this.transformInfrastructureErrors(errors));
  }

  /**
   * Alias для handleInfrastructureErrors (обратная совместимость)
   * @deprecated Используйте handleInfrastructureErrors
   */
  protected handleRepositoryResult<T>(
    result: Validation<IError[], T>,
    operation: string,
  ): Validation<IError[], T> {
    return this.handleInfrastructureErrors(result, operation);
  }

  protected logQueryExecution(
    queryName: string,
    context?: Record<string, unknown>,
  ): void {
    this.logger.info(`Executing query: ${queryName}`, context);
  }

  protected logQuerySuccess(
    queryName: string,
    result?: Record<string, unknown>,
  ): void {
    this.logger.info(`Query executed successfully: ${queryName}`, result);
  }

  /**
   * Логирование ошибок query - полиморфный подход
   */
  protected logQueryFailure(queryName: string, errors: IError[]): void {
    errors.forEach(error => {
      const level = error.getLogLevel();
      const logMethod = this.logger[level];
      logMethod.call(
        this.logger,
        `Query failed: ${queryName} - ${error.getMessage()}`,
        error.getContext()
      );
    });
  }

  /**
   * Helper для создания Pipeline шага с обработкой Infrastructure errors
   * Используется когда нужен многошаговый query с retry/условиями
   */
  protected createInfrastructureStep<TContext, T>(
    operation: string,
    fn: (ctx: TContext) => Promise<Validation<IError[], T>>
  ): (ctx: TContext) => Promise<Validation<IError[], TContext & { result: T }>> {
    return async (ctx: TContext) => {
      return this.handleInfrastructureErrors(
        await fn(ctx),
        operation
      )
        .map((result) => ({ ...ctx, result }));
    };
  }

  /**
   * Helper для создания простого Pipeline шага
   * Используется для трансформации данных без Infrastructure calls
   */
  protected createTransformStep<TContext, T>(
    fn: (ctx: TContext) => Validation<IError[], T>
  ): (ctx: TContext) => Promise<Validation<IError[], TContext & { result: T }>> {
    return async (ctx: TContext) => {
      return Promise.resolve(
        fn(ctx).map((result) => ({ ...ctx, result }))
      );
    };
  }
}
