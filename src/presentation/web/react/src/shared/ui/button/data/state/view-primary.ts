import { BUTTON_COMPOUND_STATE } from "../../domain/compound-state";

export const stateViewPrimary = {
  [BUTTON_COMPOUND_STATE.PRIMARY_IDLE]: [],

  [BUTTON_COMPOUND_STATE.PRIMARY_ERROR]: [
    "border-destructive",
    "text-destructive",
  ],

  [BUTTON_COMPOUND_STATE.PRIMARY_SUCCESS]: [
    "border-ctp-green",
    "text-foreground",
  ],

  [BUTTON_COMPOUND_STATE.PRIMARY_WARNING]: [
    "border-ctp-peach",
    "text-ctp-peach",
  ],
};
