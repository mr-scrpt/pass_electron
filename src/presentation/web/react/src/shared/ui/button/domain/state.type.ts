import { createBrandedDict } from "@/shared/lib/typescript";

const BUTTON_STATE_BRAND = "BUTTON_STATE_BRAND" as const;

export const BUTTON_STATE_ARRAY = [
  "IDLE",
  "ERROR",
  "SUCCESS",
  "WARNING",
] as const;

export const BUTTON_STATE = createBrandedDict(
  BUTTON_STATE_ARRAY,
  BUTTON_STATE_BRAND,
);

export type ButtonStateType = (typeof BUTTON_STATE)[keyof typeof BUTTON_STATE];
