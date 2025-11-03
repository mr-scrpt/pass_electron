import type { ComponentProps } from "react";
type HeaderProps = ComponentProps<"header">;
import cn from "classnames";

export const Header = (props: HeaderProps) => {
  const { className } = props;
  return <header className={cn("flex", className)}>Content</header>;
};
