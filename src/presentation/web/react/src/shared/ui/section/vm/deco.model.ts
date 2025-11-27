import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { sectionDecoCls } from "../data/deco.cls";
import type { SectionDecoType } from "../domain/deco/deco.type";

type GetSectionDecoClsParam = {
  deco: SectionDecoType;
  classNameDeco?: string;
};

export const getSectionDecoCls = (params: GetSectionDecoClsParam) => {
  const { deco, classNameDeco } = params;

  const clsDecoInner = cvax({
    variants: {
      deco: sectionDecoCls,
    },
  })({ deco });

  return { clsDecoInner: cn(clsDecoInner, classNameDeco) };
};
