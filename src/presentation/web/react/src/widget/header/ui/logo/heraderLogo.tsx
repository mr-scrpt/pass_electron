import { LOGO_SIZE, LOGO_VIEW, LOGO_VARIANT, Logo } from "@/shared/ui/logo";
import type { ComponentProps } from "react";

type LogoProps = ComponentProps<"div">;

export const HeaderLogo = () => {
  return (
    <Logo
      size={LOGO_SIZE.L}
      view={LOGO_VIEW.SECONDARY}
      variant={LOGO_VARIANT.SHIELD}
      withText
    />
  );
};
