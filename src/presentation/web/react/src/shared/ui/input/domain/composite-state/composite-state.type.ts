import type { InputStateType } from "../state/state.type";
import type { InputViewType } from "../view/view.type";
import { INPUT_COMPOSITE_STATE } from "./composite-state.const";

export type InputCompositeStateType =
  (typeof INPUT_COMPOSITE_STATE)[keyof typeof INPUT_COMPOSITE_STATE];

export type CompositeStateProps = {
  view: InputViewType;
  state: InputStateType;
};
