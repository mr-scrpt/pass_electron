import { createBrandedDict } from "@/shared/lib/typescript";

const BUTTON_VIEW_BRAND = "BUTTON_VIEW_BRAND" as const;

export const BUTTON_VIEW_VALUE_LIST = [
  "PRIMARY",
  "SECONDARY",
  "OUTLINE",
] as const;

export const BUTTON_VIEW = createBrandedDict(
  BUTTON_VIEW_VALUE_LIST,
  BUTTON_VIEW_BRAND,
);
