import { getValidatedLogger } from "@/main/composition";
import { DependencyResolutionError } from "../../errors/DependencyResolutionError";

export const useLogger = () => {
  return getValidatedLogger().mapLeft((errors) => {
    throw new DependencyResolutionError("Logger", errors);
  }).value;
};
