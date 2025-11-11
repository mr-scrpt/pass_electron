import { INPUT_VIEW_ARRAY, type InputViewType } from "./view.type";
import { INPUT_STATE_ARRAY, type InputStateType } from "./state.type";
import {
  generateCompoundArray,
  createBrandedDict,
} from "@/shared/lib/typescript";

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
  (typeof INPUT_COMPOUND_STATE)[keyof typeof INPUT_COMPOUND_STATE];

export type CompoundStateProps = {
  view: InputViewType;
  state: InputStateType;
};

export const getInputCompoundStateKey = ({ view, state }: CompoundStateProps) =>
  INPUT_COMPOUND_STATE_ARRAY.find((s) => s === `${view}_${state}`) ??
  INPUT_COMPOUND_STATE.PRIMARY_IDLE;
