import { INPUT_VIEW_ARRAY } from "./view.type";
import { INPUT_STATE_ARRAY } from "./state.type";
import { generateCompoundArray, createDict } from "@/shared/lib/typescript";

export const INPUT_COMPOUND_STATE_ARRAY = generateCompoundArray(
  INPUT_VIEW_ARRAY,
  INPUT_STATE_ARRAY,
);

export const INPUT_COMPOUND_STATE = createDict(INPUT_COMPOUND_STATE_ARRAY);

export type InputCompoundStateType =
  (typeof INPUT_COMPOUND_STATE_ARRAY)[number];
