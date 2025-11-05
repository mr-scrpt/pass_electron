// Input.tsx
import { InputLib } from "@/shared/ui/shadcn/input";
import type { ComponentProps } from "react";
import { INPUT_SIZE, type InputSizeType } from "../domain/size.type";
import { INPUT_VIEW, type InputViewType } from "../domain/view.type";
import { useInputClassBuilder } from "../model/useInputClassBuilder.model";

type InputProps = ComponentProps<"input"> & {
  size?: InputSizeType;
  view?: InputViewType;
};

export const Input = (props: InputProps) => {
  const {
    className,
    size = INPUT_SIZE.L,
    view = INPUT_VIEW.PIMARY,
    ...rest // Собираем все остальные пропсы (type, placeholder, value, onChange...)
  } = props;

  const clsInput = useInputClassBuilder({ size, view, className });

  return <InputLib className={clsInput} {...rest} />;
};
