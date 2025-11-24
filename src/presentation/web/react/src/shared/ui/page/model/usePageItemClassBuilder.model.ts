import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { pageItemBaseCls } from "../data/base.cls";
import { pageItemViewCls } from "../data/item-view.cls";
import type { PageItemViewType } from "../domain/item-view.type";

type UsePageItemClassBuilderParams = {
  view: PageItemViewType;
  className?: string;
};

export const usePageItemClassBuilder = (
  params: UsePageItemClassBuilderParams,
) => {
  const { view, className } = params;
  const classes = cvax(pageItemBaseCls, {
    variants: {
      view: pageItemViewCls,
    },
  })({ view });
  return cn(classes, className);
};
