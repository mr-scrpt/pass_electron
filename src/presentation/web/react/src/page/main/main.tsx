import { PageLayout } from "@/shared/ui/page-layout";
import { HeaderSection } from "@/widget/header";
import { ResourceListSection } from "@/widget/resourceList";
import type { ComponentProps } from "react";

// TODO: Create a real FooterWidget
const FooterWidget = () => (
  <footer className="text-center p-4 text-ctp-subtext0">
    Password Manager Footer
  </footer>
);

type MainPageProps = ComponentProps<"main">;

export const PageMain = (props: MainPageProps) => {
  return (
    <>
      <PageLayout.Header>
        <HeaderSection />
      </PageLayout.Header>
      <PageLayout.Main>
        <ResourceListSection />
      </PageLayout.Main>
      <PageLayout.Footer>
        <FooterWidget />
      </PageLayout.Footer>
    </>
  );
};
