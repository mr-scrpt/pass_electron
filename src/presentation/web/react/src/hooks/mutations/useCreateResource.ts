//  src/presentation/web/react/src/hooks/mutations/useCreateResource.ts
import { useAppMutation } from "@/shared/adapter/useAppMutation";

export type CreateResourceParams = {
  namespace: string;
  name: string;
  secret: string;
};

export function useCreateResource() {
  return useAppMutation<void, CreateResourceParams>({
    mutationFn: (params) => commands.createResource(params),
  });
}
