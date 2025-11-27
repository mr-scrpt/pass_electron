import { type ComponentProps, type ElementType } from "react";
import { TITLE_SIZE } from "../domain/size/size.const";
import type { TitleSizeType } from "../domain/size/size.type";
import { TITLE_VIEW } from "../domain/view/view.const";
import type { TitleViewType } from "../domain/view/view.type";
import { getTitleCls } from "../vm/build.model";

type TitleProps = Omit<ComponentProps<"h1">, "size"> & {
  text: string;
  size?: TitleSizeType;
  view?: TitleViewType;
  as?: ElementType;
};

export const Title = (props: TitleProps) => {
  const {
    text,
    size = TITLE_SIZE.L,
    view = TITLE_VIEW.PRIMARY,
    className,
    as: Component = "h1",
  } = props;

  const { clsTitle, clsTitleText } = getTitleCls({
    size,
    view,
    className,
  });

  return (
    <Component className={clsTitle}>
      <span className={clsTitleText}>{text}</span>
    </Component>
  );
};
