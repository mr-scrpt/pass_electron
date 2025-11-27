import { cn } from "@/shared/lib/shadcn";
import { sectionBaseCls } from "../data/base.cls";
import type { SectionAreaType } from "../domain/area/area.type";
import type { SectionDecoType } from "../domain/deco/deco.type";
import type { SectionGapType } from "../domain/gap/gap.type";
import type { SectionViewType } from "../domain/view/view.type";
import { getSectionAreaCls } from "./area.model";
import { getSectionDecoCls } from "./deco.model";
import { getSectionGapCls } from "./gap.model";
import { getSectionViewCls } from "./view.model";

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
        getSectionAreaCls({ area }).clsAreaInner,
        getSectionGapCls({ gap }).clsGapInner,
        getSectionDecoCls({ deco }).clsDecoInner,
        getSectionViewCls({ view }).clsViewInner,
      ],
      classNameInner,
    ),
    clsSectionRoot: cn(
      getSectionViewCls({ view }).clsViewRoot,
      sectionBaseCls,
      classNameRoot,
    ),
  };
};
