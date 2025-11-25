import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { sectionAreaCls } from "../data/area.cls";
import type { SectionAreaType } from "../domain/area.type";

type UseSectionAreaClsParam = {
  area: SectionAreaType;
  classNameArea?: string;
};

export const useSectionAreaCls = (params: UseSectionAreaClsParam) => {
  const { area, classNameArea: classNameDeco } = params;

  const clsArea = cvax([], {
    variants: {
      area: sectionAreaCls,
    },
  })({ area });

  return { clsAreaInner: cn(clsArea, classNameDeco) };
};
