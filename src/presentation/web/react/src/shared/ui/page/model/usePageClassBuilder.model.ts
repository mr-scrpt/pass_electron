import { cvax } from "@/shared/lib/cvax";
import { pageBaseCls } from "../data/base.cls";
import { pageViewCls } from "../data/view.cls";
import type { PageViewType } from "../domain/view.type";
import { cn } from "@/shared/lib/shadcn";

type UsePageClassBuilderParams = {
  view: PageViewType;
  className?: string;
};
export const usePageClassBuilder = (params: UsePageClassBuilderParams) => {
  const { view, className } = params;
  const classes = cvax(pageBaseCls, {
    variants: {
      view: pageViewCls,
    },
  })({ view });
  return cn(classes, className);
};
