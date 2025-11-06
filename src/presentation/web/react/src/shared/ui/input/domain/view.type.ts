import { createDict } from "@/shared/lib/typescript";

export const INPUT_VIEW_ARRAY = ["PRIMARY", "SECONDARY"] as const;

export const INPUT_VIEW = createDict(INPUT_VIEW_ARRAY);

export type InputViewType = (typeof INPUT_VIEW_ARRAY)[number];
