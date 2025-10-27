import type { Validation } from "@/shared/validation";
import { valid, invalid } from "@/shared/validation";
import type { IError } from "@/shared/errors";

type PipelineStep<TContext> = (
  ctx: TContext,
) => Promise<Validation<IError[], TContext>>;

type CompensationFn<TContext> = (ctx: TContext) => Promise<void>;

type StepMode = 'accumulate' | 'critical';

interface StepWithMode<TContext> {
  fn: PipelineStep<TContext>;
  mode: StepMode;
  skipErrorMessage?: string;  // Сообщение для заглушки при пропуске critical шага
}

export class Pipeline<TContext> {
  private steps: StepWithMode<TContext>[] = [];
  private compensations: CompensationFn<TContext>[] = [];
  private executedContexts: TContext[] = [];

  /**
   * Обычный шаг - accumulate режим (по умолчанию)
   * Продолжает выполнение при ошибках, аккумулируя их
   */
  step(fn: PipelineStep<TContext>): this {
    this.steps.push({ fn, mode: 'accumulate' });
    return this;
  }

  /**
   * Критический шаг - выполняется ТОЛЬКО если нет ошибок
   * Если есть ошибки - добавляет заглушку в аккумулятор и пропускает операцию
   */
  criticalStep(fn: PipelineStep<TContext>, skipErrorMessage: string): this {
    this.steps.push({ fn, mode: 'critical', skipErrorMessage });
    return this;
  }

  stepIf(
    condition: (ctx: TContext) => boolean,
    fn: PipelineStep<TContext>,
  ): this {
    this.steps.push({
      fn: async (ctx: TContext) =>
        condition(ctx) ? await fn(ctx) : valid(ctx),
      mode: 'accumulate',
    });
    return this;
  }

  stepWithRetry(
    fn: PipelineStep<TContext>,
    maxRetries = 3,
    delayMs = 1000,
    skipErrorMessage?: string,
  ): this {
    this.steps.push({
      fn: async (ctx: TContext) => {
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
      },
      mode: skipErrorMessage ? 'critical' : 'accumulate',
      skipErrorMessage,
    });
    return this;
  }

  parallel(...fns: PipelineStep<TContext>[]): this {
    this.steps.push({
      fn: async (ctx: TContext) => {
        const results = await Promise.all(fns.map((fn) => fn(ctx)));

        const allErrors = results
          .filter((r) => r.isLeft())
          .flatMap((r) => r.value);

        if (allErrors.length > 0) {
          return invalid(allErrors);
        }

        return valid(ctx);
      },
      mode: 'accumulate',
    });
    return this;
  }

  stepWithCompensation(
    fn: PipelineStep<TContext>,
    compensate: CompensationFn<TContext>,
  ): this {
    this.steps.push({ fn, mode: 'accumulate' });
    this.compensations.unshift(compensate);
    return this;
  }

  async execute(
    initialContext: TContext,
  ): Promise<Validation<IError[], TContext>> {
    let result: Validation<IError[], TContext> = valid(initialContext);
    let accumulatedErrors: IError[] = [];
    this.executedContexts = [];

    for (const { fn, mode, skipErrorMessage } of this.steps) {
      // 🟢 ACCUMULATE режим - продолжаем при ошибках
      if (mode === 'accumulate') {
        // Получаем контекст (из Right или используем последний успешный)
        const currentContext = result.isRight() 
          ? result.value 
          : initialContext;

        const stepResult = await fn(currentContext);

        // Аккумулируем ошибки
        if (stepResult.isLeft()) {
          accumulatedErrors = [...accumulatedErrors, ...stepResult.value];
        } else {
          // Обновляем контекст если успех
          result = stepResult;
          this.executedContexts.push(stepResult.value);
        }
        continue;
      }

      // 🔥 CRITICAL режим - выполняем ТОЛЬКО если нет ошибок
      if (mode === 'critical') {
        // Если есть накопленные ошибки - добавляем заглушку и пропускаем
        if (accumulatedErrors.length > 0) {
          // Создаем ошибку-заглушку
          const skipError = this.createSkipError(skipErrorMessage || 'Operation skipped due to validation errors');
          accumulatedErrors.push(skipError);
          
          result = invalid(accumulatedErrors);
          await this.rollback();
          break;
        }

        // Выполняем критический шаг только если result.isRight()
        if (result.isRight()) {
          const currentContext = result.value;
          result = await fn(currentContext);

          if (result.isRight()) {
            this.executedContexts.push(result.value);
          } else {
            // Critical шаг вернул ошибку - добавляем в аккумулятор
            accumulatedErrors = [...accumulatedErrors, ...result.value];
          }
        }
        continue;
      }
    }

    // Если есть накопленные ошибки - возвращаем их
    if (accumulatedErrors.length > 0) {
      await this.rollback();
      return invalid(accumulatedErrors);
    }

    if (result.isLeft()) {
      await this.rollback();
    }

    return result;
  }

  private createSkipError(message: string): IError {
    return {
      getMessage: () => message,
      getCode: () => 'OPERATION_SKIPPED',
      getContext: () => ({}),
      isExpected: () => true,
      getLogLevel: () => 'info' as const,
      toUserError: function() { return this; },
    };
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
