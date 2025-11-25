import { ResourceList } from "@/features/resourceList";
import { usePageItemClassBuilder } from "@/shared/ui/page";
import { PAGE_ITEM_VIEW } from "@/shared/ui/page/domain/item-view.type";
import { RowSection } from "@/shared/ui/section";
import type { ComponentProps } from "react";
import { ResourceListLayout } from "./layout/resourceList.layout";

type ResourceListSectionProps = ComponentProps<"div">;

export const ResourceListSection = (props: ResourceListSectionProps) => {
  const { className } = props;
  const pageCls = usePageItemClassBuilder({ view: PAGE_ITEM_VIEW.SCONDARY });
  // const { viewCls } = useSectionViewClass({
  //   view: SECTION_VIEW.PRIMARY,
  // });
  // const { clsDecoInner: decoCls } = useSectionDecoClass({
  //   deco: SECTION_DECO.BDR_CUP,
  // });

  return (
    <RowSection as="section" className={pageCls}>
      <ResourceListLayout
        content={<ResourceList />}
        action={<div>Action</div>}
      />
    </RowSection>
  );
};
