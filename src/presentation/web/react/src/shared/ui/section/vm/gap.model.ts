import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { sectionGapCls } from "../data/gap.cls";
import type { SectionGapType } from "../domain/gap/gap.type";

type GetSectionGapClsParam = {
  gap: SectionGapType;
  classNameGap?: string;
};

export const getSectionGapCls = (params: GetSectionGapClsParam) => {
  const { gap, classNameGap: classNameDeco } = params;

  const clsGapInner = cvax({
    variants: {
      gap: sectionGapCls,
    },
  })({ gap });

  return { clsGapInner: cn(clsGapInner, classNameDeco) };
};
