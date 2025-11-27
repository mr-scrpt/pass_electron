import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { sectionAreaCls } from "../data/area.cls";
import type { SectionAreaType } from "../domain/area/area.type";

type GetSectionAreaClsParam = {
  area: SectionAreaType;
  classNameArea?: string;
};

export const getSectionAreaCls = (params: GetSectionAreaClsParam) => {
  const { area, classNameArea: classNameDeco } = params;

  const clsAreaInner = cvax({
    variants: {
      area: sectionAreaCls,
    },
  })({ area });

  return { clsAreaInner: cn(clsAreaInner, classNameDeco) };
};
