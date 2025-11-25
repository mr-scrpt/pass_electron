import { ResourceList } from "@/features/resourceList";
import { RowSection } from "@/shared/ui/section";
import type { ComponentProps } from "react";
import { ResourceListLayout } from "./layout/resourceList.layout";

type ResourceListSectionProps = ComponentProps<"div">;

export const ResourceListSection = (props: ResourceListSectionProps) => {
  const { className } = props;

  return (
    <RowSection as="section" className={className}>
      <ResourceListLayout
        content={<ResourceList />}
        action={<div>Action</div>}
      />
    </RowSection>
  );
};
