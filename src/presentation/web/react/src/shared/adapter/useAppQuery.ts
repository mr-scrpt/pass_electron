import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { Validation } from "@/main/shared";
import type { IError } from "@/main/shared/errors";
import { type QueryFacade, getQueries } from "@/main/composition";

export function useAppQuery<TData>(
  options: Omit<UseQueryOptions<TData, IError[]>, "queryFn"> & {
    queryFn: () => Promise<Validation<IError[], TData>>;
  },
): UseQueryResult<TData, IError[]> {
  const { queryFn, ...restOptions } = options;

  return useQuery<TData, IError[]>({
    ...restOptions,

    queryFn: async () => {
      const result = await queryFn();

      if (result.isLeft()) {
        throw result.value;
      }

      return result.value;
    },
  });
}
export async function executeQuery<TResult>(
  fn: (queries: QueryFacade) => Promise<Validation<IError[], TResult>>,
): Promise<Validation<IError[], TResult>> {
  return await getQueries().asyncChain(fn);
}
