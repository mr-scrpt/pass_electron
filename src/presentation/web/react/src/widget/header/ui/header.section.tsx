import { RowSection } from "@/shared/ui/section";
import type { ComponentProps } from "react";
import { HeaderLayout } from "./layout/header.layout";
import { HeaderLogo } from "./logo/heraderLogo";
type HeaderProps = ComponentProps<"header">;

export const HeaderSection = (props: HeaderProps) => {
  return (
    <RowSection as="header">
      <HeaderLayout brand={<HeaderLogo />} />
    </RowSection>
  );
};
