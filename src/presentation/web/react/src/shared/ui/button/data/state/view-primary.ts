import { BUTTON_COMPOSITE_STATE } from "../../domain/composite-state/composite-state.const";

export const stateViewPrimary = {
  [BUTTON_COMPOSITE_STATE.PRIMARY_IDLE]: [],

  [BUTTON_COMPOSITE_STATE.PRIMARY_ERROR]: [
    "border-destructive",
    "text-destructive",
  ],

  [BUTTON_COMPOSITE_STATE.PRIMARY_SUCCESS]: [
    "border-ctp-green",
    "text-foreground",
  ],

  [BUTTON_COMPOSITE_STATE.PRIMARY_WARNING]: [
    "border-ctp-peach",
    "text-ctp-peach",
  ],
};
