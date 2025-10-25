import type { Validation } from "@/shared/validation";
import { valid } from "@/shared/validation";
import type { IError } from "@/shared/errors";

type PipelineStep<TContext> = (
  ctx: TContext,
) => Promise<Validation<IError[], TContext>>;

type CompensationFn<TContext> = (ctx: TContext) => Promise<void>;

export class Pipeline<TContext> {
  private steps: PipelineStep<TContext>[] = [];
  private compensations: CompensationFn<TContext>[] = [];
  private executedContexts: TContext[] = [];

  step(fn: PipelineStep<TContext>): this {
    this.steps.push(fn);
    return this;
  }

  stepIf(
    condition: (ctx: TContext) => boolean,
    fn: PipelineStep<TContext>,
  ): this {
    this.steps.push(async (ctx) =>
      condition(ctx) ? await fn(ctx) : valid(ctx),
    );
    return this;
  }

  stepWithRetry(
    fn: PipelineStep<TContext>,
    maxRetries = 3,
    delayMs = 1000,
  ): this {
    this.steps.push(async (ctx) => {
      let result = await fn(ctx);
      let attempts = 0;

      while (result.isLeft() && attempts < maxRetries) {
        const hasUnexpectedError = result.value.some(
          (error) => !error.isExpected(),
        );

        if (!hasUnexpectedError) break;

        attempts++;
        await this.delay(delayMs * attempts);
        result = await fn(ctx);
      }

      return result;
    });
    return this;
  }

  parallel(...fns: PipelineStep<TContext>[]): this {
    this.steps.push(async (ctx) => {
      const results = await Promise.all(fns.map((fn) => fn(ctx)));

      const allErrors = results
        .filter((r) => r.isLeft())
        .flatMap((r) => r.value);

      if (allErrors.length > 0) {
        return { isLeft: () => true, value: allErrors } as Validation<
          IError[],
          TContext
        >;
      }

      return valid(ctx);
    });
    return this;
  }

  stepWithCompensation(
    fn: PipelineStep<TContext>,
    compensate: CompensationFn<TContext>,
  ): this {
    this.steps.push(fn);
    this.compensations.unshift(compensate);
    return this;
  }

  async execute(
    initialContext: TContext,
  ): Promise<Validation<IError[], TContext>> {
    let result: Validation<IError[], TContext> = valid(initialContext);
    this.executedContexts = [];

    for (const step of this.steps) {
      if (result.isLeft()) {
        await this.rollback();
        break;
      }

      const currentContext = result.value;
      result = await step(currentContext);

      if (result.isRight()) {
        this.executedContexts.push(result.value);
      }
    }

    if (result.isLeft()) {
      await this.rollback();
    }

    return result;
  }

  private async rollback(): Promise<void> {
    for (let i = 0; i < this.executedContexts.length; i++) {
      const compensation = this.compensations[i];
      if (compensation) {
        try {
          await compensation(this.executedContexts[i]);
        } catch (error) {
          console.error("Compensation failed:", error);
        }
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
