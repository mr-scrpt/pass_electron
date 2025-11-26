import { cn } from "@/shared/lib/shadcn";
import { inputBaseCls, inputNativeStateCls } from "../data/base.cls";
import type { InputSizeType } from "../domain/size/size.type";
import type { InputStateType } from "../domain/state/state.type";
import type { InputViewType } from "../domain/view/view.type";
import { getInputSizeCls } from "./size.model";
import { getInputStateCls } from "./state.model";
import { getInputViewCls } from "./view.model";
import { getInputInteractionCls } from "./interaction.model";

type GetInputClsParams = {
    size: InputSizeType;
    view: InputViewType;
    state: InputStateType;
    className?: string;
};

export const getInputCls = (params: GetInputClsParams) => {
    const { view, size, state, className } = params;

    return {
        clsInput: cn(
            [
                getInputViewCls({ view }).clsView,
                getInputSizeCls({ size }).clsSize,
                getInputStateCls({ state, view }).clsState,
                getInputInteractionCls({ state, view }).clsInteraction,
            ],
            ...inputBaseCls,
            ...inputNativeStateCls,
            className,
        ),
    };
};
