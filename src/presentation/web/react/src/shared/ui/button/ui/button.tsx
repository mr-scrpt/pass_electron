import { Button as ButtonLib } from "@/shared/ui/shadcn/button";
import type { ComponentProps } from "react";
import { getButtonCls } from "../vm/build.model";
import type { ButtonSizeType } from "../domain/size/size.type";
import type { ButtonStateType } from "../domain/state/state.type";
import type { ButtonViewType } from "../domain/view/view.type";
import { BUTTON_SIZE } from "../domain/size/size.const";
import { BUTTON_VIEW } from "../domain/view/view.const";
import { BUTTON_STATE } from "../domain/state/state.const";

type ButtonProps = Omit<ComponentProps<"button">, "size"> & {
  size?: ButtonSizeType;
  view?: ButtonViewType;
  state?: ButtonStateType;
};
export const Button = (props: ButtonProps) => {
  const {
    size = BUTTON_SIZE.S,
    view = BUTTON_VIEW.PRIMARY,
    state = BUTTON_STATE.IDLE,
    disabled,
    className,
    ...rest
  } = props;

  const { clsButton } = getButtonCls({ size, view, state, className });

  return <ButtonLib className={clsButton} disabled={disabled} {...rest} />;
};
