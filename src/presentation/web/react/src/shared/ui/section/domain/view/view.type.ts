import type { SECTION_VIEW } from "./view.const";

export type SectionViewType = (typeof SECTION_VIEW)[keyof typeof SECTION_VIEW];
