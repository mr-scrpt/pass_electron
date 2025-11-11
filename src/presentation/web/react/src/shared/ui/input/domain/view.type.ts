import { createBrandedDict } from "@/shared/lib/typescript";

const INPUT_VIEW_BRAND = "InputView" as const;

export const INPUT_VIEW_ARRAY = ["PRIMARY", "SECONDARY", "OUTLINE"] as const;

export const INPUT_VIEW = createBrandedDict(INPUT_VIEW_ARRAY, INPUT_VIEW_BRAND);

export type InputViewType = typeof INPUT_VIEW[keyof typeof INPUT_VIEW];
