import { createDict } from "@/shared/lib/typescript";

const TITLE_SIZE_KEY = ["S", "M", "L", "XL"] as const;
export const TITLE_SIZE = createDict(TITLE_SIZE_KEY);

export type TitleSizeType = (typeof TITLE_SIZE_KEY)[number];
