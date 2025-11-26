import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { sectionDecoCls } from "../data/deco.cls";
import type { SectionDecoType } from "../domain/deco.type";

type UseSectionDecoClsParam = {
  deco: SectionDecoType;
  classNameDeco?: string;
};

export const useSectionDecoCls = (params: UseSectionDecoClsParam) => {
  const { deco, classNameDeco } = params;

  const decoCls = cvax({
    variants: {
      deco: sectionDecoCls,
    },
  })({ deco });

  return { clsDecoInner: cn(decoCls, classNameDeco) };
};
