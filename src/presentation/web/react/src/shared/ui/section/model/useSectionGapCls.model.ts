import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { sectionGapCls } from "../data/gap.cls";
import type { SectionGapType } from "../domain/gap.type";

type UseSectionGapClsParam = {
  gap: SectionGapType;
  classNameGap?: string;
};

export const useSectionGapCls = (params: UseSectionGapClsParam) => {
  const { gap, classNameGap: classNameDeco } = params;

  const clsGap = cvax({
    variants: {
      gap: sectionGapCls,
    },
  })({ gap });

  return { clsGapInner: cn(clsGap, classNameDeco) };
};
