import { Logo, LOGO_SIZE } from "@/shared/ui/logo";
import { Title, TITLE_SIZE, TITLE_VIEW } from "@/shared/ui/title";
import cn from "classnames";
import type { ComponentProps } from "react";
type HeaderProps = ComponentProps<"header">;

export const Header = (props: HeaderProps) => {
  const { className } = props;
  return (
    <header className={cn("flex", className)}>
      <div className="flex items-center w-full py-5">
        <Logo size={LOGO_SIZE.M} />
        <Title
          text="Password Manager"
          size={TITLE_SIZE.L}
          view={TITLE_VIEW.PIMARY}
          className="ml-auto"
        />
      </div>
    </header>
  );
};
