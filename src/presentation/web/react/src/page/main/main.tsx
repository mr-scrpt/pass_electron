import { Page } from "@/shared/ui/____page";
import { PAGE_VIEW } from "@/shared/ui/____page/domain/view.type";
import { Title } from "@/shared/ui/title";
import { HeaderSection } from "@/widget/header";
import { ResourceListSection } from "@/widget/resourceList";
import type { ComponentProps } from "react";

type MainPageProps = ComponentProps<"main">;

export const PageMain = (props: MainPageProps) => {
  return (
    <Page view={PAGE_VIEW.PRIMARY}>
      <HeaderSection className="w-full" />
      {/* <Title text="Password Manager" /> */}
      <ResourceListSection />
    </Page>
  );
};
