import { BUTTON_COMPOSITE_STATE } from "../../domain/composite-state/composite-state.const";

export const stateViewSecondary = {
  [BUTTON_COMPOSITE_STATE.SECONDARY_IDLE]: [
    "bg-ctp-green",
    "text-ctp-base",
    "border-ctp-green",
  ],

  [BUTTON_COMPOSITE_STATE.SECONDARY_ERROR]: [
    "bg-destructive",
    "text-ctp-base",
    "border-destructive",
  ],

  [BUTTON_COMPOSITE_STATE.SECONDARY_SUCCESS]: [
    "bg-ctp-green",
    "text-ctp-base",
    "border-ctp-green",
  ],

  [BUTTON_COMPOSITE_STATE.SECONDARY_WARNING]: [
    "bg-ctp-peach",
    "text-ctp-base",
    "border-ctp-peach",
  ],
};
