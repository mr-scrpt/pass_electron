import {
  BUTTON_COMPOUND_STATE,
  getButtonCompoundStateKey,
  type CompoundStateProps,
} from "../domain/compound-state";

export const useCompoundStateClass = (params: CompoundStateProps) => {
  const stateKey = getButtonCompoundStateKey(params);

  return BUTTON_COMPOUND_STATE[stateKey];
};
