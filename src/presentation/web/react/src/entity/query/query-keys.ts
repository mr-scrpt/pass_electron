export const resourceKeys = {
  all: ["resources"] as const,
  lists: () => [...resourceKeys.all, "list"] as const,
  list: (filters?: { namespace?: string; search?: string }) =>
    [...resourceKeys.lists(), filters] as const,
  details: () => [...resourceKeys.all, "detail"] as const,
  detail: (id: string) => [...resourceKeys.details(), id] as const,
} as const;

export const namespaceKeys = {
  all: ["namespaces"] as const,
  lists: () => [...namespaceKeys.all, "list"] as const,
  list: (filters?: { search?: string }) =>
    [...namespaceKeys.lists(), filters] as const,
} as const;
