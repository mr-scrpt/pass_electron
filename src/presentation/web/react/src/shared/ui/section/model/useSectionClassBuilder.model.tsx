import { cvax } from "@/shared/lib/cvax";
import type { SectionAreaType } from "../domain/area.type";
import type { SectionGapType } from "../domain/gap.type";
import { sectionAreaCls } from "../data/area.cls";
import { sectionGapCls } from "../data/gap.cls";
import { cn } from "@/shared/lib/shadcn";

type UseSectionBuilderParam = {
  area: SectionAreaType;
  gap: SectionGapType;
  className?: string;
};
export const useSectionClassBuilder = (params: UseSectionBuilderParam) => {
  const { area, gap, className } = params;

  const classes = cvax([], {
    variants: {
      area: sectionAreaCls,
      gap: sectionGapCls,
    },
  })({ area, gap });

  return cn(classes, className);
};
