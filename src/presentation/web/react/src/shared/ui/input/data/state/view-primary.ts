import { INPUT_COMPOUND_STATE } from "../../domain/compound-state.type";

export const stateViewPrimary = {
  [INPUT_COMPOUND_STATE.PRIMARY_IDLE]: [],

  [INPUT_COMPOUND_STATE.PRIMARY_ERROR]: [
    "border-destructive",
    "text-destructive",
  ],

  [INPUT_COMPOUND_STATE.PRIMARY_SUCCESS]: [
    "border-ctp-green",
    "text-foreground",
  ],

  [INPUT_COMPOUND_STATE.PRIMARY_WARNING]: [
    "border-ctp-peach",
    "text-ctp-peach",
  ],
};
