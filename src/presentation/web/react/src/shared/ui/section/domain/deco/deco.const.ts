import { createBrandedDict } from "@/shared/lib/typescript";

const SECTION_DECO_BRAND = "BUTTON_VIEW_BRAND" as const;

export const SECTION_DECO_VALUE_LIST = ["BDR_FULL", "BDR_CUP"] as const;

export const SECTION_DECO = createBrandedDict(
  SECTION_DECO_VALUE_LIST,
  SECTION_DECO_BRAND,
);
