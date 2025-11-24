import {
  createBrandedDict,
  generateCompoundArray,
} from "@/shared/lib/typescript";
import { BUTTON_STATE_VALUE_LIST, type ButtonStateType } from "./state.type";
import { BUTTON_VIEW_VALUE_LIST, type ButtonViewType } from "./view.type";

const BUTTON_COMPOUND_STATE_BRAND = "BUTTON_COMPOUND_STATE" as const;

export const BUTTON_COMPOUND_STATE_VALUE_LIST = generateCompoundArray(
  BUTTON_VIEW_VALUE_LIST,
  BUTTON_STATE_VALUE_LIST,
);

export const BUTTON_COMPOUND_STATE = createBrandedDict(
  BUTTON_COMPOUND_STATE_VALUE_LIST,
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
  BUTTON_COMPOUND_STATE_VALUE_LIST.find((s) => s === `${view}_${state}`) ??
  BUTTON_COMPOUND_STATE.PRIMARY_IDLE;
