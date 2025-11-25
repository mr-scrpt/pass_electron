// import { usePageItemClassBuilder } from "@/shared/ui/____page";
// import { PAGE_ITEM_VIEW } from "@/shared/ui/____page/domain/item-view.type";
import { RowSection } from "@/shared/ui/section";
import type { ComponentProps } from "react";
import { HeaderLayout } from "./layout/header.layout";
import { HeaderLogo } from "./logo/heraderLogo";
type HeaderProps = ComponentProps<"header">;

export const HeaderSection = (props: HeaderProps) => {
  // const pageCls = usePageItemClassBuilder({ view: PAGE_ITEM_VIEW.SCONDARY });
  // const { viewCls } = useSectionViewClass({
  //   view: SECTION_VIEW.PRIMARY,
  // });
  // const { clsDecoInner: decoCls } = useSectionDecoClass({
  //   deco: SECTION_DECO.BDR_FULL,
  // });

  return (
    <RowSection as="header">
      <HeaderLayout brand={<HeaderLogo />} />
    </RowSection>
  );
};
