import cn from "classnames";
import { type ComponentProps, type ElementType } from "react";
import { titleSizeCln } from "../domain/size.cln";
import { TITLE_SIZE, type TitleSizeType } from "../domain/size.type";
import { TITLE_VIEW, type TitleViewType } from "../domain/view.type";
import { titleViewCln } from "../domain/view.cln";

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
    view = TITLE_VIEW.PIMARY,

    className,
    as: Component = "h1",
  } = props;

  const clsTitle = cn(className);
  const clsTitleText = cn(
    "font-bold",
    [titleSizeCln[size], titleViewCln[view]],
    className,
  );

  return (
    <Component className={clsTitle}>
      <span className={clsTitleText}>{text}</span>
    </Component>
  );
};
