import type { ComponentProps, ElementType } from "react";
import { getLayoutAreaCls } from "../vm/build.model";
import { LAYOUT_BEHAVIOR } from "../domain/behavior/behavior.const";
import type { LayoutBehaviorType } from "../domain/behavior/behavior.type";

type AreaProps = ComponentProps<"div"> & {
  behavior?: LayoutBehaviorType;
  as?: ElementType;
};

export const Area = (props: AreaProps) => {
  const {
    behavior = LAYOUT_BEHAVIOR.FIXED,
    className,
    as: Component = "div",
    ...rest
  } = props;

  const { clsArea } = getLayoutAreaCls({ behavior, className });

  return <Component className={clsArea} {...rest} />;
};
