import { getEnumKeys } from "@/shared/lib/typescript";

export enum LOGO_SIZE {
  S,
  M,
  L,
  XL,
}

export type LogoSizeType = LOGO_SIZE;

export const LOGO_SIZE_KEY = getEnumKeys(LOGO_SIZE);
