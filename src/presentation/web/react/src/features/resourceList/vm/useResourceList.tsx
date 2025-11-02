import { useResourceListQuery } from "@/entity";
import { useAppNotification } from "@/shared/notification/nf";

export const useResouceList = () => {
  const { data, isError, isPending, error } = useResourceListQuery();
  const { nv } = useAppNotification();

  if (isError) {
    nv.error(error);
  }

  return {
    resourceList: data,
    isPending,
  };
};
