import { Page as PageRoot } from "./ui/page";
import { Section } from "./ui/section";

type PageCompound = typeof PageRoot & {
  Section: typeof Section;
};

const Page = PageRoot as PageCompound;
Page.Section = Section;

export { Page };

export { PAGE_VIEW } from "./domain/view/view.const";
export type { PageViewType } from "./domain/view/view.type";
export { PAGE_APPEARANCE } from "./domain/appearance/appearance.const";
export type { PageAppearanceType } from "./domain/appearance/appearance.type";
