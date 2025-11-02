import {
  useMutation,
  type UseMutationResult,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { Validation } from "@/main/shared";
import type { IError } from "@/main/shared/errors";
import { type CommandFacade, getCommands } from "@/main/composition";

export function useAppMutation<TData, TVariables>(
  options: Omit<
    UseMutationOptions<TData, IError[], TVariables>,
    "mutationFn"
  > & {
    mutationFn: (variables: TVariables) => Promise<Validation<IError[], TData>>;
  },
): UseMutationResult<TData, IError[], TVariables> {
  const { mutationFn, ...restOptions } = options;

  return useMutation<TData, IError[], TVariables>({
    ...restOptions,

    mutationFn: async (variables: TVariables) => {
      const result = await mutationFn(variables);

      if (result.isLeft()) {
        throw result.value;
      }

      return result.value;
    },
  });
}

export async function executeCommand<TResult>(
  fn: (commands: CommandFacade) => Promise<Validation<IError[], TResult>>,
): Promise<Validation<IError[], TResult>> {
  return await getCommands().asyncChain(fn);
}
