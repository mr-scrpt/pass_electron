import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { inputStateCln } from "../data/state/state.cls";
import type { InputStateType } from "../domain/state/state.type";
import type { InputViewType } from "../domain/view/view.type";
import { getCompositeState } from "../domain/composite-state/composite-state";

type GetInputStateClsParams = {
    state: InputStateType;
    view: InputViewType;
    classNameState?: string;
};

export const getInputStateCls = (params: GetInputStateClsParams) => {
    const { state, view, classNameState } = params;

    const compositeState = getCompositeState({ view, state });

    const classes = cvax({
        variants: {
            state: inputStateCln,
        },
    })({
        state: compositeState,
    });

    return { clsState: cn(classes, classNameState) };
};
