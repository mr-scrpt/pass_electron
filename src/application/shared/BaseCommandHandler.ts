//  src/application/shared/BaseCommandHandler.ts
import type { IError } from "@/shared/errors";
import { CommandValidationError } from "@/application/errors";
import type { Validation } from "@/shared/validation";
import { tapLeft, valid, invalid } from "@/shared/validation";
import type { ILogger } from "@/application/ports";

export abstract class BaseCommandHandler {
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
   * Трансформация в CommandValidationError
   * Функциональный подход через map
   */
  protected transformDomainErrors(
    result: Validation<IError[], never>,
    operation: string,
  ): Validation<IError[], never> {
    return result.mapLeft((errors) =>
      errors.map(
        (error) =>
          new CommandValidationError(
            `Failed to ${operation}: ${error.getMessage()}`,
            errors.map((err) => err.getMessage()),
          ),
      ),
    );
  }

  /**
   * Обработка Infrastructure errors (repository, external services)
   * - Логирует ТОЛЬКО unexpected ошибки
   * - Трансформирует ошибки через toUserError()
   * 
   * @deprecated Используйте handleRepositoryResult для обратной совместимости
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

  protected logCommandExecution(
    commandName: string,
    context?: Record<string, unknown>,
  ): void {
    this.logger.info(`Executing command: ${commandName}`, context);
  }

  protected logCommandSuccess(
    commandName: string,
    result?: Record<string, unknown>,
  ): void {
    this.logger.info(`Command executed successfully: ${commandName}`, result);
  }

  /**
   * Логирование ошибок команды - полиморфный подход
   */
  protected logCommandFailure(commandName: string, errors: IError[]): void {
    errors.forEach(error => {
      const level = error.getLogLevel();
      const logMethod = this.logger[level];
      logMethod.call(
        this.logger,
        `Command failed: ${commandName} - ${error.getMessage()}`,
        error.getContext()
      );
    });
  }

  /**
   * Helper для создания Pipeline шага с обработкой Infrastructure errors
   * Используется для repository/external service вызовов
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
   * Helper для создания Pipeline шага с Domain валидацией
   * Domain ошибки НЕ логируются (это expected flow)
   */
  protected createDomainValidationStep<TContext, T>(
    fn: (ctx: TContext) => Validation<IError[], T>
  ): (ctx: TContext) => Promise<Validation<IError[], TContext & { result: T }>> {
    return async (ctx: TContext) => {
      return Promise.resolve(
        fn(ctx).map((result) => ({ ...ctx, result }))
      );
    };
  }

  /**
   * Helper для проверки уникальности (found/not found)
   * Используется в Pipeline для проверки существования ресурса
   */
  protected createUniquenessCheck<TContext, TEntity>(
    shouldExist: boolean,
    errorIfFailed: (ctx: TContext) => IError
  ): (ctx: TContext & { result: TEntity | null }) => Promise<Validation<IError[], TContext & { result: TEntity | null }>> {
    return async (ctx) => {
      const exists = ctx.result !== null;
      
      if (exists === shouldExist) {
        return valid(ctx);
      }
      
      return invalid([errorIfFailed(ctx)]);
    };
  }
}
