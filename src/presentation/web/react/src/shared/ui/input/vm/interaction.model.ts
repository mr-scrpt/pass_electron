import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { inputInteractionCln } from "../data/interaction/interaction.cls";
import type { InputStateType } from "../domain/state/state.type";
import type { InputViewType } from "../domain/view/view.type";
import { getCompositeInteraction } from "../domain/composite-interaction/composite-interaction";

type GetInputInteractionClsParams = {
    view: InputViewType;
    state: InputStateType;
    classNameInteraction?: string;
};

export const getInputInteractionCls = (
    params: GetInputInteractionClsParams,
) => {
    const { view, state, classNameInteraction } = params;
    const compositeInteraction = getCompositeInteraction({ view, state });

    const classes = cvax({
        multiVariants: {
            interaction: inputInteractionCln,
        },
    })({
        interaction: compositeInteraction,
    });

    return { clsInteraction: cn(classes, classNameInteraction) };
};
