import { INPUT_COMPOSITE_STATE } from "../../domain/composite-state/composite-state.const";

export const stateViewPrimary = {
  [INPUT_COMPOSITE_STATE.PRIMARY_IDLE]: [],

  [INPUT_COMPOSITE_STATE.PRIMARY_ERROR]: [
    "border-destructive",
    "text-destructive",
  ],

  [INPUT_COMPOSITE_STATE.PRIMARY_SUCCESS]: [
    "border-ctp-green",
    "text-foreground",
  ],

  [INPUT_COMPOSITE_STATE.PRIMARY_WARNING]: [
    "border-ctp-peach",
    "text-ctp-peach",
  ],
};
