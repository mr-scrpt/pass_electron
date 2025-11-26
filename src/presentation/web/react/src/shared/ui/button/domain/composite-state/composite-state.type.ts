import type { ButtonStateType } from "../state/state.type";
import type { ButtonViewType } from "../view/view.type";
import { BUTTON_COMPOSITE_STATE } from "./composite-state.const";

export type ButtonCompositeStateType =
  (typeof BUTTON_COMPOSITE_STATE)[keyof typeof BUTTON_COMPOSITE_STATE];

export type CompositeStateProps = {
  view: ButtonViewType;
  state: ButtonStateType;
};
