import { createBrandedDict } from "@/shared/lib/typescript";

const PAGE_APPEARANCE_BRAND = "PAGE_APPEARANCE_BRAND" as const;

export const PAGE_APPEARANCE_VALUE_LIST = [
  "DEFAULT",
  "SURFACE",
  "TRANSPARENT",
] as const;

export const PAGE_APPEARANCE = createBrandedDict(
  PAGE_APPEARANCE_VALUE_LIST,
  PAGE_APPEARANCE_BRAND,
);
