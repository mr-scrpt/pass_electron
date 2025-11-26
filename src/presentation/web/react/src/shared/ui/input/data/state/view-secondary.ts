import { INPUT_COMPOSITE_STATE } from "../../domain/composite-state/composite-state.const";

export const stateViewSecondary = {
  [INPUT_COMPOSITE_STATE.SECONDARY_IDLE]: [
    "bg-ctp-green",
    "text-ctp-base",
    "border-ctp-green",
  ],

  [INPUT_COMPOSITE_STATE.SECONDARY_ERROR]: [
    "bg-destructive",
    "text-ctp-base",
    "border-destructive",
  ],

  [INPUT_COMPOSITE_STATE.SECONDARY_SUCCESS]: [
    "bg-ctp-green",
    "text-ctp-base",
    "border-ctp-green",
  ],

  [INPUT_COMPOSITE_STATE.SECONDARY_WARNING]: [
    "bg-ctp-peach",
    "text-ctp-base",
    "border-ctp-peach",
  ],
};
