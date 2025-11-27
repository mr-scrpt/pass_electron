import type { INPUT_VIEW } from "./view.const";

export type InputViewType = (typeof INPUT_VIEW)[keyof typeof INPUT_VIEW];
