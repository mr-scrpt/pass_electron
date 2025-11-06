import { createBrandedDict } from "@/shared/lib/typescript";

const INPUT_SIZE_BRAND = "InputSize" as const;

export const INPUT_SIZE_ARRAY = ["S", "M", "L", "XL"] as const;

export const INPUT_SIZE = createBrandedDict(INPUT_SIZE_ARRAY, INPUT_SIZE_BRAND);

export type InputSizeType = typeof INPUT_SIZE[keyof typeof INPUT_SIZE];
