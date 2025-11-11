import {
  getInputCompoundInteractionKeyList,
  INPUT_COMPOUND_INTERACTION,
} from "../domain/compound-interaction.type";
import type { CompoundStateProps } from "../domain/compound-state.type";
import { useCompoundStateClass } from "./useStateClass.model";

export const useCompoundInteractionClass = (props: CompoundStateProps) => {
  const compoundState = useCompoundStateClass(props);
  const interactionKeyList = getInputCompoundInteractionKeyList({
    compoundState,
  });

  const iteractionObjectKeyList = interactionKeyList.filter(
    (key) => key in INPUT_COMPOUND_INTERACTION,
  );

  console.log("output_log: IN  =>>>", iteractionObjectKeyList);
  return iteractionObjectKeyList;
};
