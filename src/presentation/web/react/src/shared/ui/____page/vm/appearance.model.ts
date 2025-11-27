import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { pageAppearanceCls } from "../data/appearance.cls";
import type { PageAppearanceType } from "../domain/appearance/appearance.type";

type GetPageAppearanceClsParams = {
  appearance: PageAppearanceType;
  classNameAppearance?: string;
};

export const getPageAppearanceCls = (params: GetPageAppearanceClsParams) => {
  const { appearance, classNameAppearance } = params;

  const classes = cvax({
    variants: {
      appearance: pageAppearanceCls,
    },
  })({
    appearance,
  });

  return { clsAppearance: cn(classes, classNameAppearance) };
};
