import { ErrorClassifier } from "@/shared/errors/ErrorClassifier";
import { GenericApplicationError } from "@/application/errors";
import type { Validation } from "@/shared/validation";
import { invalid } from "@/shared/validation";
import type { ILogger } from "@/application/ports";

export abstract class BaseQueryHandler {
  protected readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  protected checkInfrastructureErrors(
    errors: Error[],
    operation: string,
  ): Validation<Error[], never> | null {
    const errorCheck = ErrorClassifier.check(errors);

    if (!errorCheck.hasInfrastructureErrors && !errorCheck.hasUnknownErrors) {
      return null;
    }

    if (errorCheck.hasInfrastructureErrors) {
      this.logger.error(`Infrastructure error: ${operation}`, {
        errors: errorCheck.classification.infrastructure.map((e) => ({
          code: e.code,
          message: e.message,
          severity: e.severity,
        })),
      });
    }

    if (errorCheck.hasUnknownErrors) {
      this.logger.error(`Unknown error: ${operation}`, {
        errors: errorCheck.classification.unknown.map((e) => ({
          name: e.name,
          message: e.message,
          stack: e.stack,
        })),
      });
    }

    return invalid([
      new GenericApplicationError(
        `Cannot ${operation}: service temporarily unavailable`,
      ),
    ]);
  }

  protected handleRepositoryResult<T>(
    result: Validation<Error[], T>,
    operation: string,
  ): Validation<Error[], T> | null {
    if (result.isRight()) {
      return null;
    }

    const errorCheck = this.checkInfrastructureErrors(result.value, operation);

    if (errorCheck !== null) {
      return errorCheck;
    }

    return result;
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

  protected logQueryFailure(queryName: string, errors: Error[]): void {
    const errorCheck = ErrorClassifier.check(errors);

    if (errorCheck.hasInfrastructureErrors || errorCheck.hasUnknownErrors) {
      this.logger.error(`Query failed: ${queryName}`, {
        infrastructure: errorCheck.classification.infrastructure,
        unknown: errorCheck.classification.unknown,
      });
    }
  }
}
