import type { ComponentProps } from "react";
import { ResourceListItem } from "./resourceListItem";
import { useResouceList } from "../vm/useResourceList";

type ResourceListProps = ComponentProps<"div">;

export const ResourceList = (props: ResourceListProps) => {
  const { ...rest } = props;
  const { resourceList, isPending } = useResouceList();
  return (
    <div {...rest}>
      <div className="flex flex-col">
        {true && <div className="flex flex-col items-center">Loading...</div>}
        {!true &&
          resourceList?.map((item) => (
            <ResourceListItem
              data={{ name: item.name, namespace: item.namespace }}
            />
          ))}
      </div>
    </div>
  );
};
