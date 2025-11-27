import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { titleSizeCls } from "../data/size.cls";
import type { TitleSizeType } from "../domain/size/size.type";

type GetTitleSizeClsParams = {
    size: TitleSizeType;
    classNameSize?: string;
};

export const getTitleSizeCls = (params: GetTitleSizeClsParams) => {
    const { size, classNameSize } = params;

    const classes = cvax({
        variants: {
            size: titleSizeCls,
        },
    })({
        size,
    });

    return { clsSize: cn(classes, classNameSize) };
};
