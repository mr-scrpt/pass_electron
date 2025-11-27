import { PageLayout as PageLayoutRoot } from "./ui/page-layout";
import { Header } from "./ui/header";
import { Main } from "./ui/main";
import { Footer } from "./ui/footer";
import { Section } from "./ui/section";

type PageLayoutCompound = typeof PageLayoutRoot & {
  Header: typeof Header;
  Main: typeof Main;
  Footer: typeof Footer;
  Section: typeof Section;
};

const PageLayout = PageLayoutRoot as PageLayoutCompound;
PageLayout.Header = Header;
PageLayout.Main = Main;
PageLayout.Footer = Footer;
PageLayout.Section = Section;

export { PageLayout };
