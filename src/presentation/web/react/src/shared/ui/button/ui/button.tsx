import { Button as ButtonLib } from "@/shared/ui/shadcn/button";
import type { ComponentProps } from "react";
import { BUTTON_SIZE, type ButtonSizeType } from "../domain/size.type";
import { BUTTON_STATE, type ButtonStateType } from "../domain/state.type";
import { BUTTON_VIEW, type ButtonViewType } from "../domain/view.type";
import { useButtonClassBuilder } from "../model/useInputClassBuilder.modle";

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

  const clsButton = useButtonClassBuilder({ size, view, state, className });

  return <ButtonLib className={clsButton} disabled={disabled} {...rest} />;
};
