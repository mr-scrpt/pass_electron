import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { titleViewCls } from "../data/view.cls";
import type { TitleViewType } from "../domain/view/view.type";

type GetTitleViewClsParams = {
    view: TitleViewType;
    classNameView?: string;
};

export const getTitleViewCls = (params: GetTitleViewClsParams) => {
    const { view, classNameView } = params;

    const classes = cvax({
        variants: {
            view: titleViewCls,
        },
    })({
        view,
    });

    return { clsView: cn(classes, classNameView) };
};
