import { BUTTON_VIEW } from "./view.const";

export type ButtonViewType = (typeof BUTTON_VIEW)[keyof typeof BUTTON_VIEW];
