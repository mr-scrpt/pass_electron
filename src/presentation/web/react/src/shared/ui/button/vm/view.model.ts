import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { buttonViewCls } from "../data/view.cls";
import type { ButtonViewType } from "../domain/view/view.type";

type GetButtonViewClsParams = {
  view: ButtonViewType;
  classNameView?: string;
};

export const getButtonViewCls = (params: GetButtonViewClsParams) => {
  const { view, classNameView } = params;

  const classes = cvax({
    variants: {
      view: buttonViewCls,
    },
  })({
    view,
  });

  return { clsView: cn(classes, classNameView) };
};
