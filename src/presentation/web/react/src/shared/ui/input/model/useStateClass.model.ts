import {
  getInputCompoundStateKey,
  INPUT_COMPOUND_STATE,
  type CompoundStateProps,
} from "../domain/compound-state.type";

export const useCompoundStateClass = (props: CompoundStateProps) => {
  const stateKey = getInputCompoundStateKey(props);

  return INPUT_COMPOUND_STATE[stateKey];
};
