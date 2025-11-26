import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { buttonViewCls } from "../data/view.cls";
import type { ButtonViewType } from "../domain/view.type";

type UseButtonViewClsParams = {
  view: ButtonViewType;
  classNameView?: string;
};

export const useButtonViewCls = (params: UseButtonViewClsParams) => {
  const { view, classNameView } = params;

  const classes = cvax([], {
    variants: {
      view: buttonViewCls,
    },
  })({
    view,
  });

  return { clsView: cn(classes, classNameView) };
};
