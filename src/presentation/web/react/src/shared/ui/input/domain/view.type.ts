import { getEnumKeys } from "@/shared/lib/typescript";

export enum INPUT_VIEW {
  PIMARY,
  SECONDARY,
}
export type InputViewType = INPUT_VIEW;
export const INPUT_VIEW_KEY = getEnumKeys(INPUT_VIEW);
