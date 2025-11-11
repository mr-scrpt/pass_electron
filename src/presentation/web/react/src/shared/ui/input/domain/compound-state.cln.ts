import {
  INPUT_COMPOUND_STATE,
  type InputCompoundStateType,
} from "./compound-state.type";
import type { EnsureAllKeys } from "@/shared/lib/typescript";

export const inputCompoundStateCln = {
  [INPUT_COMPOUND_STATE.PRIMARY_IDLE]: [],

  [INPUT_COMPOUND_STATE.PRIMARY_ERROR]: [
    "border-destructive",
    "text-destructive",
  ],

  [INPUT_COMPOUND_STATE.PRIMARY_SUCCESS]: [
    "border-ctp-green",
    "text-foreground",
  ],

  [INPUT_COMPOUND_STATE.PRIMARY_WARNING]: [
    "border-ctp-peach",
    "text-ctp-peach",
  ],

  [INPUT_COMPOUND_STATE.SECONDARY_IDLE]: [
    "bg-ctp-green",
    "text-ctp-base",
    "border-ctp-green",
  ],

  [INPUT_COMPOUND_STATE.SECONDARY_ERROR]: [
    "bg-destructive",
    "text-ctp-base",
    "border-destructive",
  ],

  [INPUT_COMPOUND_STATE.SECONDARY_SUCCESS]: [
    "bg-ctp-green",
    "text-ctp-base",
    "border-ctp-green",
  ],

  [INPUT_COMPOUND_STATE.SECONDARY_WARNING]: [
    "bg-ctp-peach",
    "text-ctp-base",
    "border-ctp-peach",
  ],

  [INPUT_COMPOUND_STATE.OUTLINE_IDLE]: [],

  [INPUT_COMPOUND_STATE.OUTLINE_ERROR]: [
    "border-destructive",
    "text-destructive",
  ],

  [INPUT_COMPOUND_STATE.OUTLINE_SUCCESS]: [
    "border-ctp-green",
    "text-ctp-green",
  ],

  [INPUT_COMPOUND_STATE.OUTLINE_WARNING]: [
    "border-ctp-peach",
    "text-ctp-peach",
  ],
} satisfies EnsureAllKeys<InputCompoundStateType, string[]>;
