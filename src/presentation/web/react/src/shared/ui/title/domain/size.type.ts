import { getEnumKeys } from "@/shared/lib/typescript";

export enum TITLE_SIZE {
  S,
  M,
  L,
  XL,
}

export type TitleSizeType = TITLE_SIZE;

export const TITLE_SIZE_KEY = getEnumKeys(TITLE_SIZE);
