import { INPUT_COMPOUND_STATE } from "../../domain/compound-state.type";

export const stateViewOutline = {
  [INPUT_COMPOUND_STATE.OUTLINE_IDLE]: ["text-ctp-lavender-100"],

  [INPUT_COMPOUND_STATE.OUTLINE_ERROR]: [
    "border-destructive",
    "text-destructive",
    "text-ctp-lavender-100",
  ],

  [INPUT_COMPOUND_STATE.OUTLINE_SUCCESS]: [
    "border-ctp-green",
    "text-ctp-lavender-100",
  ],

  [INPUT_COMPOUND_STATE.OUTLINE_WARNING]: [
    "border-ctp-peach",
    "text-ctp-lavender-100",
  ],
};
