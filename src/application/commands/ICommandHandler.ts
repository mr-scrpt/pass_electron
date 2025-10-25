import type { Validation } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import type { ICommand } from "./ICommand";

/**
 * Базовый интерфейс для Command Handler
 *
 * @template C - тип Command
 * 
 * Command всегда возвращает void (побочные эффекты)
 * Если нужен результат - используйте Query
 */
export interface ICommandHandler<C extends ICommand = ICommand> {
  handle(command: C): Promise<Validation<IError[], void>>;
}
