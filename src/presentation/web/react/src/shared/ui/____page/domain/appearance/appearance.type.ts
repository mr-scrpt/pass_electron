import type { PAGE_APPEARANCE } from "./appearance.const";

export type PageAppearanceType =
  (typeof PAGE_APPEARANCE)[keyof typeof PAGE_APPEARANCE];
