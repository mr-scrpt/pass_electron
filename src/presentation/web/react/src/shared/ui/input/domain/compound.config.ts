import { INPUT_VIEW } from "./view.type";
import { INPUT_STATE } from "./state.type";
import { INPUT_COMPOUND_STATE } from "./compound-state.type";
import type { InputViewType } from "./view.type";
import type { InputStateType } from "./state.type";
import type { InputCompoundStateType } from "./compound-state.type";

export const inputCompoundStateMapping = {
  [INPUT_VIEW.PRIMARY]: {
    [INPUT_STATE.IDLE]: INPUT_COMPOUND_STATE.PRIMARY_IDLE,
    [INPUT_STATE.ERROR]: INPUT_COMPOUND_STATE.PRIMARY_ERROR,
    [INPUT_STATE.SUCCESS]: INPUT_COMPOUND_STATE.PRIMARY_SUCCESS,
    [INPUT_STATE.WARNING]: INPUT_COMPOUND_STATE.PRIMARY_WARNING,
  },

  [INPUT_VIEW.SECONDARY]: {
    [INPUT_STATE.IDLE]: INPUT_COMPOUND_STATE.SECONDARY_IDLE,
    [INPUT_STATE.ERROR]: INPUT_COMPOUND_STATE.SECONDARY_ERROR,
    [INPUT_STATE.SUCCESS]: INPUT_COMPOUND_STATE.SECONDARY_SUCCESS,
    [INPUT_STATE.WARNING]: INPUT_COMPOUND_STATE.SECONDARY_WARNING,
  },
} satisfies Record<
  InputViewType,
  Record<InputStateType, InputCompoundStateType>
>;
