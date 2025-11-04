// Input.tsx
import { cn } from "@/shared/lib/shadcn";
import type { ComponentProps } from "react";
import { INPUT_SIZE, type InputSizeType } from "../domain/size.type";
import { INPUT_VIEW, type InputViewType } from "../domain/view.type";
import { InputLib } from "@/shared/ui/shadcn/input";
import { inputSizeCln } from "../domain/size.cln";
import { inputViewCln } from "../domain/view.cln";

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

  const clsInput = cn([inputSizeCln[size], inputViewCln[view]], className);

  // Передаем ...rest в InputLib
  return <InputLib className={clsInput} {...rest} />;
};
