import { createDict } from "@/shared/lib/typescript";

const TITLE_VIEW_KEY = ["PIMARY", "SECONDARY"] as const;
export const TITLE_VIEW = createDict(TITLE_VIEW_KEY);

export type TitleViewType = (typeof TITLE_VIEW_KEY)[number];
