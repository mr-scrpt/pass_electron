import {
  createBrandedDict,
  generateCompoundArray,
} from "@/shared/lib/typescript";
import { BUTTON_STATE_ARRAY, type ButtonStateType } from "./state.type";
import { BUTTON_VIEW_ARRAY, type ButtonViewType } from "./view.type";

const BUTTON_COMPOUND_STATE_BRAND = "BUTTON_COMPOUND_STATE" as const;

export const BUTTON_COMPOUND_STATE_ARRAY = generateCompoundArray(
  BUTTON_VIEW_ARRAY,
  BUTTON_STATE_ARRAY,
);

export const BUTTON_COMPOUND_STATE = createBrandedDict(
  BUTTON_COMPOUND_STATE_ARRAY,
  BUTTON_COMPOUND_STATE_BRAND,
);

export type ButtonCompoundStateType =
  (typeof BUTTON_COMPOUND_STATE)[keyof typeof BUTTON_COMPOUND_STATE];

export type CompoundStateProps = {
  view: ButtonViewType;
  state: ButtonStateType;
};

export const getButtonCompoundStateKey = ({
  view,
  state,
}: CompoundStateProps) =>
  BUTTON_COMPOUND_STATE_ARRAY.find((s) => s === `${view}_${state}`) ??
  BUTTON_COMPOUND_STATE.PRIMARY_IDLE;
