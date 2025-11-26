import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { buttonSizeCls } from "../data/size.cln";
import type { ButtonSizeType } from "../domain/size/size.type";

type GetButtonSizeClsParams = {
  size: ButtonSizeType;
  classNameSize?: string;
};

export const getButtonSizeCls = (params: GetButtonSizeClsParams) => {
  const { size, classNameSize } = params;

  const classes = cvax([], {
    variants: {
      size: buttonSizeCls,
    },
  })({
    size,
  });

  return { clsSize: cn(classes, classNameSize) };
};
