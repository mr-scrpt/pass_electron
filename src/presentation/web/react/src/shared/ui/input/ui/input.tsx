import { InputLib } from "@/shared/ui/shadcn/input";
import type { ComponentProps } from "react";
import { INPUT_SIZE, type InputSizeType } from "../domain/size.type";
import { INPUT_VIEW, type InputViewType } from "../domain/view.type";
import { INPUT_STATE, type InputStateType } from "../domain/state.type";
import { useInputClassBuilder } from "../model/useInputClassBuilder.model";

type InputProps = Omit<ComponentProps<"input">, "size"> & {
  size?: InputSizeType;
  view?: InputViewType;
  state?: InputStateType;
};

export const Input = (props: InputProps) => {
  const {
    className,
    size = INPUT_SIZE.L,
    view = INPUT_VIEW.PRIMARY,
    state = INPUT_STATE.IDLE,
    disabled,
    readOnly,
    ...rest
  } = props;

  const clsInput = useInputClassBuilder({
    size,
    view,
    state,
    className,
  });

  return (
    <InputLib
      className={clsInput}
      disabled={disabled}
      readOnly={readOnly}
      {...rest}
    />
  );
};
