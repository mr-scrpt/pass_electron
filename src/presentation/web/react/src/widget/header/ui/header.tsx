import { Logo, LOGO_SIZE, LOGO_VARIANT, LOGO_VIEW } from "@/shared/ui/logo";
import { RowSection } from "@/shared/ui/section";
import type { ComponentProps } from "react";
type HeaderProps = ComponentProps<"header">;

export const Header = (props: HeaderProps) => {
  const { className } = props;
  return (
    <RowSection as="header">
      <Logo
        size={LOGO_SIZE.L}
        view={LOGO_VIEW.SECONDARY}
        variant={LOGO_VARIANT.SHIELD}
        withText
      />
    </RowSection>
  );
};

{
  /* <header className={cn("flex", className)}> */
}
{
  /*   <div className="flex items-center w-full py-5"> */
}
{
  /*     <Logo */
}
{
  /*       size={LOGO_SIZE.L} */
}
{
  /*       view={LOGO_VIEW.SECONDARY} */
}
{
  /*       variant={LOGO_VARIANT.SHIELD} */
}
{
  /*       withText */
}
{
  /*     /> */
}
{
  /*   </div> */
}
{
  /* </header> */
}
{
  /**/
}
