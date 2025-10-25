import type { AppError } from "./AppError";
import type { ILogger } from "@/application/ports";

export type ErrorClassification = {
  operational: AppError[];

  infrastructure: AppError[];

  unknown: Error[];
};

export type ErrorCheckResult = {
  hasInfrastructureErrors: boolean;
  hasOperationalErrors: boolean;
  hasUnknownErrors: boolean;
  hasAnyErrors: boolean;
  classification: ErrorClassification;
};

export class ErrorClassifier {
  static classify(errors: Error[]): ErrorClassification {
    const operational: AppError[] = [];
    const infrastructure: AppError[] = [];
    const unknown: Error[] = [];

    for (const error of errors) {
      if (this.isAppError(error)) {
        if (error.isOperational) {
          operational.push(error);
        } else {
          infrastructure.push(error);
        }
      } else {
        unknown.push(error);
      }
    }

    return { operational, infrastructure, unknown };
  }

  static check(errors: Error[]): ErrorCheckResult {
    const classification = this.classify(errors);

    return {
      hasInfrastructureErrors: classification.infrastructure.length > 0,
      hasOperationalErrors: classification.operational.length > 0,
      hasUnknownErrors: classification.unknown.length > 0,
      hasAnyErrors: errors.length > 0,
      classification,
    };
  }

  static hasInfrastructureErrors(errors: Error[]): boolean {
    return errors.some((e) => this.isAppError(e) && !e.isOperational);
  }

  static hasOperationalErrors(errors: Error[]): boolean {
    return errors.some((e) => this.isAppError(e) && e.isOperational);
  }

  static getUserMessage(errors: Error[]): string {
    const { operational, infrastructure, unknown } = this.classify(errors);

    if (operational.length > 0) {
      return operational.map((e) => e.message).join("; ");
    }

    if (infrastructure.length > 0) {
      return "Service temporarily unavailable. Please try again later.";
    }

    if (unknown.length > 0) {
      return "An unexpected error occurred. Please contact support.";
    }

    return "Unknown error";
  }

  static log(errors: Error[], logger: ILogger, context: string): void {
    const { operational, infrastructure, unknown } = this.classify(errors);

    if (operational.length > 0) {
      operational.forEach((e) => {
        if (e.severity === "high") {
          logger.warn(`${context}: ${e.message}`, {
            code: e.code,
            severity: e.severity,
          });
        } else {
          logger.info(`${context}: ${e.message}`, {
            code: e.code,
            severity: e.severity,
          });
        }
      });
    }

    if (infrastructure.length > 0) {
      logger.error(`${context}: Infrastructure errors`, {
        errors: infrastructure.map((e) => ({
          code: e.code,
          message: e.message,
          severity: e.severity,
          cause: e.cause,
        })),
      });
    }

    if (unknown.length > 0) {
      logger.error(`${context}: Unknown errors`, {
        errors: unknown.map((e) => ({
          name: e.name,
          message: e.message,
          stack: e.stack,
        })),
      });
    }
  }

  private static isAppError(error: Error): error is AppError {
    return (
      "code" in error &&
      "isOperational" in error &&
      "severity" in error &&
      typeof (error as AppError).code === "string" &&
      typeof (error as AppError).isOperational === "boolean" &&
      ((error as AppError).severity === "low" ||
        (error as AppError).severity === "medium" ||
        (error as AppError).severity === "high")
    );
  }

  static canContinue(errors: Error[]): boolean {
    const errorCheck = this.check(errors);
    return !errorCheck.hasInfrastructureErrors && !errorCheck.hasUnknownErrors;
  }
}
