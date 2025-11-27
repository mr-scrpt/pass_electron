import { PageLayout } from "@/shared/ui/page-layout";
import { HeaderSection } from "@/widget/header";
import { ResourceListSection } from "@/widget/resourceList";
import { PAGE_VIEW, PAGE_APPEARANCE } from "@/shared/ui/____page";
import { LAYOUT_BEHAVIOR } from "@/shared/ui/layout";
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
    <PageLayout view={PAGE_VIEW.PRIMARY}>
      <PageLayout.Section
        behavior={LAYOUT_BEHAVIOR.FIXED}
        appearance={PAGE_APPEARANCE.TRANSPARENT}
      >
        <HeaderSection />
      </PageLayout.Section>

      <PageLayout.Section
        behavior={LAYOUT_BEHAVIOR.FLUID}
        appearance={PAGE_APPEARANCE.DEFAULT}
        className="overflow-y-auto"
      >
        <ResourceListSection />
      </PageLayout.Section>

      <PageLayout.Section
        behavior={LAYOUT_BEHAVIOR.FIXED}
        appearance={PAGE_APPEARANCE.SURFACE}
      >
        <FooterWidget />
      </PageLayout.Section>
    </PageLayout>
  );
};
