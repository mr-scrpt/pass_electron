import {
  BUTTON_COMPOUND_INTERACTION,
  getButtonCompoundInteractionKeyList,
} from "../domain/compound-interaction.type";
import type { CompoundStateProps } from "../domain/compound-state";
import { useCompoundStateClass } from "./useCompoundState.model";

export const useComputedInteractionClass = (params: CompoundStateProps) => {
  const compoundState = useCompoundStateClass(params);

  const interactionKeyList = getButtonCompoundInteractionKeyList({
    compoundState,
  });

  const filtered = interactionKeyList.filter(
    (key) => key in BUTTON_COMPOUND_INTERACTION,
  );

  return filtered;
};
