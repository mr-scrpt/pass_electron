import type { SECTION_DECO } from "./deco.const";

export type SectionDecoType = (typeof SECTION_DECO)[keyof typeof SECTION_DECO];
