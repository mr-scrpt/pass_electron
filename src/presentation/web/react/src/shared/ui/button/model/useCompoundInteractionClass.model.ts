import { INPUT_COMPOUND_INTERACTION } from "../../input/domain/compound-interaction.type";
import { getButtonCompoundInteractionKeyList } from "../domain/compound-interaction.type";
import type { CompoundStateProps } from "../domain/compound-state";
import { useCompoundStateClass } from "./useCompoundState.model";

export const useComputedInteractionClass = (params: CompoundStateProps) => {
  const compoundState = useCompoundStateClass(params);

  const interactionKeyList = getButtonCompoundInteractionKeyList({
    compoundState,
  });

  return interactionKeyList.filter((key) => key in INPUT_COMPOUND_INTERACTION);
};
