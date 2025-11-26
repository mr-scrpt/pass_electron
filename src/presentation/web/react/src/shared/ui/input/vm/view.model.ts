import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { inputViewCls } from "../data/view.cls";
import type { InputViewType } from "../domain/view/view.type";

type GetInputViewClsParams = {
    view: InputViewType;
    classNameView?: string;
};

export const getInputViewCls = (params: GetInputViewClsParams) => {
    const { view, classNameView } = params;

    const classes = cvax({
        variants: {
            view: inputViewCls,
        },
    })({
        view,
    });

    return { clsView: cn(classes, classNameView) };
};
