import { PageLayout as PageLayoutRoot } from "./ui/page-layout";
import { Section } from "./ui/section";

type PageLayoutCompound = typeof PageLayoutRoot & {
  Section: typeof Section;
};

const PageLayout = PageLayoutRoot as PageLayoutCompound;
PageLayout.Section = Section;

export { PageLayout };
