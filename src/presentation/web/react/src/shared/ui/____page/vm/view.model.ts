import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { pageViewCls } from "../data/view.cls";
import type { PageViewType } from "../domain/view/view.type";

type GetPageViewClsParams = {
  view: PageViewType;
  classNameView?: string;
};

export const getPageViewCls = (params: GetPageViewClsParams) => {
  const { view, classNameView } = params;

  const classes = cvax({
    variants: {
      view: pageViewCls,
    },
  })({
    view,
  });

  return { clsView: cn(classes, classNameView) };
};
