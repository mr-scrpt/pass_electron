import {
  getInputCompoundStateKey,
  INPUT_COMPOUND_STATE,
  type CompoundStateProps,
} from "../domain/compound-state.type";

export const useCompoundStateClass = (params: CompoundStateProps) => {
  const stateKey = getInputCompoundStateKey(params);

  return INPUT_COMPOUND_STATE[stateKey];
};
