import { INPUT_VIEW_ARRAY } from "./view.type";
import { INPUT_STATE_ARRAY } from "./state.type";
import { generateCompoundArray, createBrandedDict } from "@/shared/lib/typescript";

const INPUT_COMPOUND_STATE_BRAND = "InputCompoundState" as const;

export const INPUT_COMPOUND_STATE_ARRAY = generateCompoundArray(
  INPUT_VIEW_ARRAY,
  INPUT_STATE_ARRAY,
);

export const INPUT_COMPOUND_STATE = createBrandedDict(
  INPUT_COMPOUND_STATE_ARRAY,
  INPUT_COMPOUND_STATE_BRAND,
);

export type InputCompoundStateType =
  typeof INPUT_COMPOUND_STATE[keyof typeof INPUT_COMPOUND_STATE];
