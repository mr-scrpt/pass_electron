import { cn } from "@/shared/lib/shadcn";
import type { SectionAreaType } from "../domain/area.type";
import type { SectionGapType } from "../domain/gap.type";
import { useSectionAreaCls } from "./useSectionAreaCls.model";
import { useSectionGapCls } from "./useSectionGapCls.model";
import { useSectionDecoCls } from "./useSectionDecoClass.model";
import type { SectionDecoType } from "../domain/deco.type";
import type { SectionViewType } from "../domain/view.type";
import { useSectionViewCls } from "./useSectionViewCls.model";
import { sectionBaseCls } from "../data/base.cls";

type UseSectionBuilderParam = {
  area: SectionAreaType;
  gap: SectionGapType;
  deco: SectionDecoType;
  view: SectionViewType;
  classNameRoot?: string;
  classNameInner?: string;
};
export const useSectionClsBuilder = (params: UseSectionBuilderParam) => {
  const { area, gap, deco, view, classNameRoot, classNameInner } = params;

  return {
    clsSectionInner: cn(
      [
        useSectionAreaCls({ area }).clsAreaInner,
        useSectionGapCls({ gap }).clsGapInner,
        useSectionDecoCls({ deco }).clsDecoInner,
        useSectionViewCls({ view }).clsViewInner,
      ],
      classNameInner,
    ),
    clsSectionRoot: cn(
      useSectionViewCls({ view }).clsViewRoot,
      sectionBaseCls,
      classNameRoot,
    ),
  };
};
