import { getCompositeState } from "../composite-state/composite-state";
import type {
    InputCompositeStateType,
    CompositeStateProps,
} from "../composite-state/composite-state.type";
import {
    INPUT_COMPOSITE_INTERACTION,
    INPUT_COMPOSITE_INTERACTION_VALUE_LIST,
} from "./composite-interaction.const";
import type { InputCompositeInteractionType } from "./composite-interaction.type";

export const getCompositeInteractionKeyList = ({
    compositeState,
}: {
    compositeState: InputCompositeStateType;
}): InputCompositeInteractionType[] => {
    return INPUT_COMPOSITE_INTERACTION_VALUE_LIST.filter((key) =>
        key.startsWith(compositeState),
    ) as InputCompositeInteractionType[];
};

export const getCompositeInteraction = (params: CompositeStateProps) => {
    const compositeState = getCompositeState(params);

    const interactionKeyList = getCompositeInteractionKeyList({
        compositeState: compositeState,
    });

    const filtered = interactionKeyList.filter(
        (key) => key in INPUT_COMPOSITE_INTERACTION,
    );

    return filtered;
};
