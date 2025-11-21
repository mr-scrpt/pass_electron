import { Button as ButtonLib } from "@/shared/ui/shadcn/button";
import type { ComponentType } from "react";
import { BUTTON_SIZE, type ButtonSizeType } from "../domain/size.type";

type ButtonProps = Omit<ComponentType<"button">, "size"> & {
  size?: ButtonSizeType;
};
export const Button = (props: ButtonProps) => {
  const { size = BUTTON_SIZE.S } = props;

  return <ButtonLib />;
};
