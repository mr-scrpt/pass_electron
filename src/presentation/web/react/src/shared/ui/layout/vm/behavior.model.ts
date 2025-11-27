import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { layoutBehaviorCls } from "../data/behavior.cls";
import type { LayoutBehaviorType } from "../domain/behavior/behavior.type";

type GetLayoutBehaviorClsParams = {
  behavior: LayoutBehaviorType;
  classNameBehavior?: string;
};

export const getLayoutBehaviorCls = (
  params: GetLayoutBehaviorClsParams,
) => {
  const { behavior, classNameBehavior } = params;

  const classes = cvax({
    variants: {
      behavior: layoutBehaviorCls,
    },
  })({
    behavior,
  });

  return { clsBehavior: cn(classes, classNameBehavior) };
};
