import { createBrandedDict } from "@/shared/lib/typescript";

const SECTION_GAP_BRAND = "BUTTON_VIEW_BRAND" as const;

export const SECTION_GAP_ARRAY = ["PRIMARY", "FREE"] as const;

export const SECTION_GAP = createBrandedDict(
  SECTION_GAP_ARRAY,
  SECTION_GAP_BRAND,
);

export type SectionGapType = (typeof SECTION_GAP)[keyof typeof SECTION_GAP];
