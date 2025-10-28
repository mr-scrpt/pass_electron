import type { ICommandBus } from "@/application/commands";
import type { Validation } from "@/shared/validation";
import { isTrue } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import { InfrastructureError } from "@/shared/errors";
import { IQueryBus } from "@/application/queries";

export abstract class BaseModule<TConfig, TDeps> {
  protected dependencies: TDeps | null = null;

  initialize(config: TConfig): void {
    this.dependencies = this.buildDependencies(config);
  }

  protected abstract buildDependencies(config: TConfig): TDeps;

  protected checkInitialization(): Validation<IError[], TDeps> {
    return isTrue(this.dependencies !== null, this.dependencies!)
      .valid()
      .invalid([
        new InfrastructureError(
          this.constructor.name,
          "Module not initialized. Call initialize() first.",
        ),
      ]);
  }

  abstract registerQueryHandlers(queryBus: IQueryBus): void;

  abstract registerCommandHandlers(commandBus: ICommandBus): void;

  reset(): void {
    this.dependencies = null;
  }
}
