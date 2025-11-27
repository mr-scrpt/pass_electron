import { cn } from "@/shared/lib/shadcn";
import type { TitleSizeType } from "../domain/size/size.type";
import type { TitleViewType } from "../domain/view/view.type";
import { titleBaseCls, titleTextBaseCls } from "../data/base.cls";
import { getTitleSizeCls } from "./size.model";
import { getTitleViewCls } from "./view.model";

type GetTitleClsParams = {
    size: TitleSizeType;
    view: TitleViewType;
    className?: string;
};

export const getTitleCls = (params: GetTitleClsParams) => {
    const { size, view, className } = params;

    return {
        clsTitle: cn(titleBaseCls, className),
        clsTitleText: cn(
            titleTextBaseCls,
            getTitleSizeCls({ size }).clsSize,
            getTitleViewCls({ view }).clsView,
        ),
    };
};
