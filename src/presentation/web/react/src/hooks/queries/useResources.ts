//  src/presentation/web/react/src/hooks/queries/useResources.ts
import type { ResourceListItemDTO } from "@/application/queries/dtos";
import { queries } from "@/composition";
import { useAppQuery } from "@/shared/adapter/useAppQuery";
import { resourceKeys } from "../../lib/query-keys";

export function useResources(filters?: {
  namespace?: string;
  search?: string;
}) {
  return useAppQuery<ResourceListItemDTO[]>({
    queryKey: resourceKeys.list(filters),
    queryFn: () => queries.list(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
