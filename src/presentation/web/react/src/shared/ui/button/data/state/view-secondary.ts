import { BUTTON_COMPOUND_STATE } from "../../domain/compound-state";

export const stateViewSecondary = {
  [BUTTON_COMPOUND_STATE.SECONDARY_IDLE]: [
    "bg-ctp-green",
    "text-ctp-base",
    "border-ctp-green",
  ],

  [BUTTON_COMPOUND_STATE.SECONDARY_ERROR]: [
    "bg-destructive",
    "text-ctp-base",
    "border-destructive",
  ],

  [BUTTON_COMPOUND_STATE.SECONDARY_SUCCESS]: [
    "bg-ctp-green",
    "text-ctp-base",
    "border-ctp-green",
  ],

  [BUTTON_COMPOUND_STATE.SECONDARY_WARNING]: [
    "bg-ctp-peach",
    "text-ctp-base",
    "border-ctp-peach",
  ],
};
