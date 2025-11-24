import { INPUT_VIEW_VALUE_LIST, type InputViewType } from "./view.type";
import { INPUT_STATE_VALUE_LIST, type InputStateType } from "./state.type";
import {
  generateCompoundArray,
  createBrandedDict,
} from "@/shared/lib/typescript";

const INPUT_COMPOUND_STATE_BRAND = "INPUT_COMPOUND_STATE" as const;

export const INPUT_COMPOUND_STATE_VALUE_LIST = generateCompoundArray(
  INPUT_VIEW_VALUE_LIST,
  INPUT_STATE_VALUE_LIST,
);

export const INPUT_COMPOUND_STATE = createBrandedDict(
  INPUT_COMPOUND_STATE_VALUE_LIST,
  INPUT_COMPOUND_STATE_BRAND,
);

export type InputCompoundStateType =
  (typeof INPUT_COMPOUND_STATE)[keyof typeof INPUT_COMPOUND_STATE];

export type CompoundStateProps = {
  view: InputViewType;
  state: InputStateType;
};

export const getInputCompoundStateKey = ({ view, state }: CompoundStateProps) =>
  INPUT_COMPOUND_STATE_VALUE_LIST.find((s) => s === `${view}_${state}`) ??
  INPUT_COMPOUND_STATE.PRIMARY_IDLE;
