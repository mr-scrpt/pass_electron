import { createDict } from "@/shared/lib/typescript";

export const INPUT_SIZE_ARRAY = ["S", "M", "L", "XL"] as const;

export const INPUT_SIZE = createDict(INPUT_SIZE_ARRAY);

export type InputSizeType = (typeof INPUT_SIZE_ARRAY)[number];
