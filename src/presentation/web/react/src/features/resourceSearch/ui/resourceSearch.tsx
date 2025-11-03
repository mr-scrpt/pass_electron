import type { ComponentProps } from "react";
import cn from "classnames";

type ResourceSearchProps = ComponentProps<"div">;

export const ResourseSearch = (props: ResourceSearchProps) => {
  const { className } = props;

  return <div className={cn(className)}>e</div>;
};
