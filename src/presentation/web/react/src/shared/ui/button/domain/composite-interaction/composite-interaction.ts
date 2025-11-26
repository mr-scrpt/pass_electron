import { getCompositeState } from "../composite-state/composite-state";
import type {
  ButtonCompositeStateType,
  CompositeStateProps,
} from "../composite-state/composite-state.type";
import {
  BUTTON_COMPOSITE_INTERACTION,
  BUTTON_COMPOSITE_INTERACTION_VALUE_LIST,
} from "./composite-interaction.const";
import type { ButtonCompositeInteractionType } from "./composite-interaction.type";

export const getCompositeInteractionKeyList = ({
  compositeState,
}: {
  compositeState: ButtonCompositeStateType;
}): ButtonCompositeInteractionType[] => {
  return BUTTON_COMPOSITE_INTERACTION_VALUE_LIST.filter((key) =>
    key.startsWith(compositeState),
  ) as ButtonCompositeInteractionType[];
};

export const getCompositeInteraction = (params: CompositeStateProps) => {
  const compositeState = getCompositeState(params);

  const interactionKeyList = getCompositeInteractionKeyList({
    compositeState: compositeState,
  });

  const filtered = interactionKeyList.filter(
    (key) => key in BUTTON_COMPOSITE_INTERACTION,
  );

  return filtered;
};
