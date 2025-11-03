import type { ComponentProps } from "react";
type HeaderProps = ComponentProps<"header">;
import cn from "classnames";

export const Header = (props: HeaderProps) => {
  const { className } = props;
  return (
    <header className={cn("flex", className)}>
      <div className="flex justify-end w-full">
        <h1>Password Manager</h1>
      </div>
    </header>
  );
};
