import type { ComponentProps, ElementType } from "react";
import { getLayoutCls } from "../vm/build.model";
import { LAYOUT_ORIENTATION } from "../domain/orientation/orientation.const";
import type { LayoutOrientationType } from "../domain/orientation/orientation.type";

type LayoutProps = ComponentProps<"div"> & {
  orientation?: LayoutOrientationType;
  as?: ElementType;
};

export const Layout = (props: LayoutProps) => {
  const {
    orientation = LAYOUT_ORIENTATION.VERTICAL,
    className,
    as: Component = "div",
    ...rest
  } = props;

  const { clsLayout } = getLayoutCls({ orientation, className });

  return <Component className={clsLayout} {...rest} />;
};
