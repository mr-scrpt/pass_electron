import { createBrandedDict } from "@/shared/lib/typescript";

const BUTTON_SIZE_BRAND = "BUTTON_SIZE_BRAND" as const;

export const BUTTON_SIZE_VALUE_LIST = ["S", "M", "L", "XL"] as const;

export const BUTTON_SIZE = createBrandedDict(
  BUTTON_SIZE_VALUE_LIST,
  BUTTON_SIZE_BRAND,
);

export type ButtonSizeType = (typeof BUTTON_SIZE)[keyof typeof BUTTON_SIZE];
