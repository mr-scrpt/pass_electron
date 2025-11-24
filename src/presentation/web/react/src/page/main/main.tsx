import { ResourceList } from "@/features/resourceList";
import { Page } from "@/shared/ui/page";
import { PAGE_VIEW } from "@/shared/ui/page/domain/view.type";
import { Title } from "@/shared/ui/title";
import { HeaderSection } from "@/widget/header";
import type { ComponentProps } from "react";

type MainPageProps = ComponentProps<"main">;

export const PageMain = (props: MainPageProps) => {
  return (
    <Page view={PAGE_VIEW.PRIMARY}>
      <HeaderSection className="w-full" />
      <Title text="Password Manager" />
      <ResourceList />
    </Page>
  );
};
