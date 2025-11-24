import { createBrandedDict } from "@/shared/lib/typescript";

const INPUT_VIEW_BRAND = "INPUT_VIWE_BRAND" as const;

export const INPUT_VIEW_VALUE_LIST = [
  "PRIMARY",
  "SECONDARY",
  "OUTLINE",
] as const;

export const INPUT_VIEW = createBrandedDict(
  INPUT_VIEW_VALUE_LIST,
  INPUT_VIEW_BRAND,
);

export type InputViewType = (typeof INPUT_VIEW)[keyof typeof INPUT_VIEW];
