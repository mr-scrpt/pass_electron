import {
  getInputCompoundInteractionKeyList,
  INPUT_COMPOUND_INTERACTION,
} from "../domain/compound-interaction.type";
import type { CompoundStateProps } from "../domain/compound-state.type";
import { useCompoundStateClass } from "./useCompoundStateClass.model";

export const useCompoundInteractionClass = (params: CompoundStateProps) => {
  const compoundState = useCompoundStateClass(params);
  const interactionKeyList = getInputCompoundInteractionKeyList({
    compoundState,
  });

  const iteractionObjectKeyList = interactionKeyList.filter(
    (key) => key in INPUT_COMPOUND_INTERACTION,
  );

  return iteractionObjectKeyList;
};
