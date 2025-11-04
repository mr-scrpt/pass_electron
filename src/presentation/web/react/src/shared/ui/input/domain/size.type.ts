import { getEnumKeys } from "@/shared/lib/typescript";

export enum INPUT_SIZE {
  S,
  M,
  L,
  XL,
}

export type InputSizeType = INPUT_SIZE;

export const INPUT_SIZE_KEY = getEnumKeys(INPUT_SIZE);
