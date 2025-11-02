import type { ComponentProps } from "react";
type ResourceListItemProps = ComponentProps<"div"> & {
  data: { namespace: string; name: string };
};
export const ResourceListItem = (props: ResourceListItemProps) => {
  const { data, ...rest } = props;
  const { name, namespace } = data;
  return (
    <div {...rest}>
      <div>{name}</div>
      <div>{namespace}</div>
    </div>
  );
};
