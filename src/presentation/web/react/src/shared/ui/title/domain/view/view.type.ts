import { TITLE_VIEW } from "./view.const";

export type TitleViewType = (typeof TITLE_VIEW)[keyof typeof TITLE_VIEW];
