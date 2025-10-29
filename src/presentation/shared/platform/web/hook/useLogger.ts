import { getValidatedLogger } from "@/main/composition";
import { DependencyResolutionError } from "../../errors/DependencyResolutionError";

/**
 * React Hook для получения Logger из DI контейнера
 * 
 * @throws {DependencyResolutionError} если DI не инициализирован
 * @returns {ILogger} экземпляр Logger
 */
export const useLogger = () => {
  return getValidatedLogger()
    .mapLeft((errors) => {
      throw new DependencyResolutionError("Logger", errors);
    })
    .value;
};
