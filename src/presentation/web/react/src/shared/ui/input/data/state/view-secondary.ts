import { INPUT_COMPOUND_STATE } from "../../domain/compound-state.type";

export const stateViewSecondary = {
  [INPUT_COMPOUND_STATE.SECONDARY_IDLE]: [
    "bg-ctp-green",
    "text-ctp-base",
    "border-ctp-green",
  ],

  [INPUT_COMPOUND_STATE.SECONDARY_ERROR]: [
    "bg-destructive",
    "text-ctp-base",
    "border-destructive",
  ],

  [INPUT_COMPOUND_STATE.SECONDARY_SUCCESS]: [
    "bg-ctp-green",
    "text-ctp-base",
    "border-ctp-green",
  ],

  [INPUT_COMPOUND_STATE.SECONDARY_WARNING]: [
    "bg-ctp-peach",
    "text-ctp-base",
    "border-ctp-peach",
  ],
};
