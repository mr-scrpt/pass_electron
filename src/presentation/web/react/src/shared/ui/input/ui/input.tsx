import { InputLib } from "@/shared/ui/shadcn/input";
import type { ComponentProps } from "react";
import { INPUT_SIZE } from "../domain/size/size.const";
import type { InputSizeType } from "../domain/size/size.type";
import { INPUT_VIEW } from "../domain/view/view.const";
import type { InputViewType } from "../domain/view/view.type";
import { INPUT_STATE } from "../domain/state/state.const";
import type { InputStateType } from "../domain/state/state.type";
import { getInputCls } from "../vm/build.model";

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

  const { clsInput } = getInputCls({
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
