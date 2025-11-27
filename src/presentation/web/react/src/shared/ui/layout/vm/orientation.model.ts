import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { layoutOrientationCls } from "../data/orientation.cls";
import type { LayoutOrientationType } from "../domain/orientation/orientation.type";

type GetLayoutOrientationClsParams = {
  orientation: LayoutOrientationType;
  classNameOrientation?: string;
};

export const getLayoutOrientationCls = (
  params: GetLayoutOrientationClsParams,
) => {
  const { orientation, classNameOrientation } = params;

  const classes = cvax({
    variants: {
      orientation: layoutOrientationCls,
    },
  })({
    orientation,
  });

  return { clsOrientation: cn(classes, classNameOrientation) };
};
