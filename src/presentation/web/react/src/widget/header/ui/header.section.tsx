import { RowSection } from "@/shared/ui/section";
import type { ComponentProps } from "react";
import { HeaderLayout } from "./layout/headerLayout";
import { HeaderLogo } from "./logo/heraderLogo";
import { usePageItemClassBuilder } from "@/shared/ui/page";
import { PAGE_ITEM_VIEW } from "@/shared/ui/page/domain/item-view.type";
type HeaderProps = ComponentProps<"header">;

export const HeaderSection = (props: HeaderProps) => {
  const sectionCls = usePageItemClassBuilder({ view: PAGE_ITEM_VIEW.SCONDARY });
  return (
    <RowSection as="header" className={sectionCls}>
      <HeaderLayout brand={<HeaderLogo />} />
    </RowSection>
  );
};
