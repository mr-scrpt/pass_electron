import { createBrandedDict } from "@/shared/lib/typescript";

const SECTION_VIEW_BRAND = "BUTTON_VIEW_BRAND" as const;

export const SECTION_VIEW_VALUE_LIST = ["PRIMARY", "SECONDARY"] as const;

export const SECTION_VIEW = createBrandedDict(
  SECTION_VIEW_VALUE_LIST,
  SECTION_VIEW_BRAND,
);

export type SectionViewType = (typeof SECTION_VIEW)[keyof typeof SECTION_VIEW];
