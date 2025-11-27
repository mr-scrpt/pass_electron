import { cn } from "@/shared/lib/shadcn";
import { layoutBaseCls } from "../data/base.cls";
import type { LayoutOrientationType } from "../domain/orientation/orientation.type";
import type { LayoutBehaviorType } from "../domain/behavior/behavior.type";
import { getLayoutOrientationCls } from "./orientation.model";
import { getLayoutBehaviorCls } from "./behavior.model";

// For <Layout> component
type GetLayoutClsParams = {
  orientation: LayoutOrientationType;
  className?: string;
};

export const getLayoutCls = (params: GetLayoutClsParams) => {
  const { orientation, className } = params;

  return {
    clsLayout: cn(
      layoutBaseCls,
      getLayoutOrientationCls({ orientation }).clsOrientation,
      className,
    ),
  };
};

// For <Layout.Area> component
type GetLayoutAreaClsParams = {
  behavior: LayoutBehaviorType;
  className?: string;
};

export const getLayoutAreaCls = (params: GetLayoutAreaClsParams) => {
  const { behavior, className } = params;

  return {
    clsArea: cn(getLayoutBehaviorCls({ behavior }).clsBehavior, className),
  };
};
