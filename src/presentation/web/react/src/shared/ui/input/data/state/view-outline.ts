import { INPUT_COMPOSITE_STATE } from "../../domain/composite-state/composite-state.const";

export const stateViewOutline = {
  [INPUT_COMPOSITE_STATE.OUTLINE_IDLE]: ["text-ctp-lavender-100"],

  [INPUT_COMPOSITE_STATE.OUTLINE_ERROR]: [
    "border-destructive",
    "text-destructive",
    "text-ctp-lavender-100",
  ],

  [INPUT_COMPOSITE_STATE.OUTLINE_SUCCESS]: [
    "border-ctp-green",
    "text-ctp-lavender-100",
  ],

  [INPUT_COMPOSITE_STATE.OUTLINE_WARNING]: [
    "border-ctp-peach",
    "text-ctp-lavender-100",
  ],
};
