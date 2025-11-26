import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { inputSizeCln } from "../data/size.cls";
import type { InputSizeType } from "../domain/size/size.type";

type GetInputSizeClsParams = {
    size: InputSizeType;
    classNameSize?: string;
};

export const getInputSizeCls = (params: GetInputSizeClsParams) => {
    const { size, classNameSize } = params;

    const classes = cvax({
        variants: {
            size: inputSizeCln,
        },
    })({
        size,
    });

    return { clsSize: cn(classes, classNameSize) };
};
