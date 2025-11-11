// import {
//   INPUT_COMPOUND_STATE,
//   type InputCompoundStateType,
// } from "./compound-state.type";
// import { INTERACTION_THEME } from "./theme-interaction.type";
// import type { EnsureAllKeys } from "@/shared/lib/typescript";
//
// export const inputCompoundStateBehaviorCln = {
//   [INPUT_COMPOUND_STATE.PRIMARY_IDLE]: {
//     focus: INTERACTION_THEME.PRIMARY,
//     hover: INTERACTION_THEME.PRIMARY,
//     active: INTERACTION_THEME.PRIMARY,
//   },
//
//   [INPUT_COMPOUND_STATE.PRIMARY_ERROR]: {
//     focus: INTERACTION_THEME.ATTENTION,
//     hover: INTERACTION_THEME.ATTENTION,
//     active: INTERACTION_THEME.ATTENTION,
//   },
//
//   [INPUT_COMPOUND_STATE.PRIMARY_SUCCESS]: {
//     focus: INTERACTION_THEME.SUCCESS,
//     hover: INTERACTION_THEME.SUCCESS,
//     active: INTERACTION_THEME.SUCCESS,
//   },
//
//   [INPUT_COMPOUND_STATE.PRIMARY_WARNING]: {
//     focus: INTERACTION_THEME.WARNING,
//     hover: INTERACTION_THEME.WARNING,
//     active: INTERACTION_THEME.WARNING,
//   },
//
//   [INPUT_COMPOUND_STATE.SECONDARY_IDLE]: {
//     focus: INTERACTION_THEME.SECONDARY,
//     hover: INTERACTION_THEME.SECONDARY,
//     active: INTERACTION_THEME.SECONDARY,
//   },
//
//   [INPUT_COMPOUND_STATE.SECONDARY_ERROR]: {
//     focus: INTERACTION_THEME.SECONDARY,
//     hover: INTERACTION_THEME.SECONDARY,
//     active: INTERACTION_THEME.SECONDARY,
//   },
//
//   [INPUT_COMPOUND_STATE.SECONDARY_SUCCESS]: {
//     focus: INTERACTION_THEME.SECONDARY,
//     hover: INTERACTION_THEME.SECONDARY,
//     active: INTERACTION_THEME.SECONDARY,
//   },
//
//   [INPUT_COMPOUND_STATE.SECONDARY_WARNING]: {
//     focus: INTERACTION_THEME.SECONDARY,
//     hover: INTERACTION_THEME.SECONDARY,
//     active: INTERACTION_THEME.SECONDARY,
//   },
//
//   [INPUT_COMPOUND_STATE.OUTLINE_IDLE]: {
//     focus: INTERACTION_THEME.OUTLINE,
//     hover: INTERACTION_THEME.OUTLINE,
//     active: INTERACTION_THEME.OUTLINE,
//   },
//
//   [INPUT_COMPOUND_STATE.OUTLINE_ERROR]: {
//     focus: INTERACTION_THEME.OUTLINE,
//     hover: INTERACTION_THEME.OUTLINE,
//     active: INTERACTION_THEME.OUTLINE,
//   },
//
//   [INPUT_COMPOUND_STATE.OUTLINE_SUCCESS]: {
//     focus: INTERACTION_THEME.OUTLINE,
//     hover: INTERACTION_THEME.OUTLINE,
//     active: INTERACTION_THEME.OUTLINE,
//   },
//
//   [INPUT_COMPOUND_STATE.OUTLINE_WARNING]: {
//     focus: INTERACTION_THEME.OUTLINE,
//     hover: INTERACTION_THEME.OUTLINE,
//     active: INTERACTION_THEME.OUTLINE,
//   },
// } satisfies EnsureAllKeys<
//   InputCompoundStateType,
//   {
//     focus: (typeof INTERACTION_THEME)[keyof typeof INTERACTION_THEME];
//     hover: (typeof INTERACTION_THEME)[keyof typeof INTERACTION_THEME];
//     active: (typeof INTERACTION_THEME)[keyof typeof INTERACTION_THEME];
//   }
// >;
