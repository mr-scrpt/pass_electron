import { type ResourceItemListDTO } from "@/main/composition";
import { executeQuery, useAppQuery } from "@/shared/adapter/useAppQuery";
import { resourceKeys } from "./query-keys";

export function useResourceListQuery(filters?: {
  namespace?: string;
  search?: string;
}) {
  return useAppQuery<ResourceItemListDTO[]>({
    queryKey: resourceKeys.list(filters),
    queryFn: () => executeQuery((q) => q.list()),
  });
}
