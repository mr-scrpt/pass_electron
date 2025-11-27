import type { PAGE_VIEW } from "./view.const";

export type PageViewType = (typeof PAGE_VIEW)[keyof typeof PAGE_VIEW];
