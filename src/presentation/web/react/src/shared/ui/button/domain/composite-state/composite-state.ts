import {
  BUTTON_COMPOSITE_STATE_VALUE_LIST,
  COMPOSITE_STATE_DEFAULT_KEY,
  BUTTON_COMPOSITE_STATE,
} from "./composite-state.const";
import type { CompositeStateProps } from "./composite-state.type";

const getCompositeStateKey = ({ view, state }: CompositeStateProps) => {
  const found = BUTTON_COMPOSITE_STATE_VALUE_LIST.find(
    (s) => s === `${view}_${state}`,
  );

  return (found ??
    COMPOSITE_STATE_DEFAULT_KEY) as keyof typeof BUTTON_COMPOSITE_STATE;
};

export const getCompositeState = (params: CompositeStateProps) => {
  return BUTTON_COMPOSITE_STATE[getCompositeStateKey(params)];
};
