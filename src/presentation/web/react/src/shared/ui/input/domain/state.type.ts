import { createDict } from "@/shared/lib/typescript";

export const INPUT_STATE_ARRAY = [
  "IDLE",
  "ERROR",
  "SUCCESS",
  "WARNING",
] as const;

export const INPUT_STATE = createDict(INPUT_STATE_ARRAY);

export type InputStateType = (typeof INPUT_STATE_ARRAY)[number];
