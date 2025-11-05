import { cn } from "@/shared/lib/shadcn";
import { INPUT_SIZE, INPUT_VIEW } from "@/shared/ui/input";
import { Input } from "@/shared/ui/input";
import type { ComponentProps } from "react";

type ResourceSearchProps = ComponentProps<"div">;

export const ResourseSearch = (props: ResourceSearchProps) => {
  const { className } = props;
  console.log("output_log: PARENT  =>>>", INPUT_SIZE.S);

  return (
    <div className={cn(className)}>
      <div className="flex">
        <Input size={INPUT_SIZE.S} view={INPUT_VIEW.PIMARY} />
      </div>
    </div>
  );
};
