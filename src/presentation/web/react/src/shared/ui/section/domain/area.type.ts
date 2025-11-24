import { createBrandedDict } from "@/shared/lib/typescript";

const SECTION_AREA_BRAND = "BUTTON_VIEW_BRAND" as const;

export const SECTION_AREA_VALUE_LIST = ["FULL", "CONTAINER"] as const;

export const SECTION_AREA = createBrandedDict(
  SECTION_AREA_VALUE_LIST,
  SECTION_AREA_BRAND,
);

export type SectionAreaType = (typeof SECTION_AREA)[keyof typeof SECTION_AREA];
