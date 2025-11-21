import { BUTTON_COMPOUND_STATE } from "../../domain/compound-state";

export const stateViewOutline = {
  [BUTTON_COMPOUND_STATE.OUTLINE_IDLE]: ["text-ctp-lavender-100"],

  [BUTTON_COMPOUND_STATE.OUTLINE_ERROR]: [
    "border-destructive",
    "text-destructive",
    "text-ctp-lavender-100",
  ],

  [BUTTON_COMPOUND_STATE.OUTLINE_SUCCESS]: [
    "border-ctp-green",
    "text-ctp-lavender-100",
  ],

  [BUTTON_COMPOUND_STATE.OUTLINE_WARNING]: [
    "border-ctp-peach",
    "text-ctp-lavender-100",
  ],
};
