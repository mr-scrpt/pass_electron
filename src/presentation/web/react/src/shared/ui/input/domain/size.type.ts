import { createBrandedDict } from "@/shared/lib/typescript";

const INPUT_SIZE_BRAND = "InputSize" as const;

export const INPUT_SIZE_VALUE_LIST = ["S", "M", "L", "XL"] as const;

export const INPUT_SIZE = createBrandedDict(
  INPUT_SIZE_VALUE_LIST,
  INPUT_SIZE_BRAND,
);

export type InputSizeType = (typeof INPUT_SIZE)[keyof typeof INPUT_SIZE];
