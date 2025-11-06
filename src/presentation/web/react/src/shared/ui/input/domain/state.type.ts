import { createBrandedDict } from "@/shared/lib/typescript";

const INPUT_STATE_BRAND = "InputState" as const;

export const INPUT_STATE_ARRAY = [
  "IDLE",
  "ERROR",
  "SUCCESS",
  "WARNING",
] as const;

export const INPUT_STATE = createBrandedDict(INPUT_STATE_ARRAY, INPUT_STATE_BRAND);

export type InputStateType = typeof INPUT_STATE[keyof typeof INPUT_STATE];
