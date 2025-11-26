import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { sectionViewCls } from "../data/view.cls";
import type { SectionViewType } from "../domain/view.type";

type UseSectionViewClsParam = {
  view: SectionViewType;
  classNameView?: string;
};

export const useSectionViewCls = (params: UseSectionViewClsParam) => {
  const { view, classNameView } = params;

  const clsViewInner = cvax({
    variants: {
      view: sectionViewCls,
    },
  })({ view });

  const clsViewRoot = cvax({ variants: { view: sectionViewCls } })({
    view,
  });

  return { clsViewInner: cn(clsViewInner, classNameView), clsViewRoot };
};
