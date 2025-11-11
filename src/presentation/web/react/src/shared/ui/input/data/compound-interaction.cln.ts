import type { EnsureAllKeys } from "@/shared/lib/typescript";
import {
  INPUT_COMPOUND_INTERACTION,
  type InputCompoundIteractionType,
} from "../domain/compound-interaction.type";

const BASE_FOCUS = [
  "focus-visible:interactive:outline-none",
  "focus-visible:interactive:ring-2",
] as const;

const BASE_ACTIVE = ["active:interactive:scale-[0.99]"] as const;

const SECONDARY_INTERACTION_SET = {
  focus: [...BASE_FOCUS, "focus-visible:interactive:ring-ctp-green"],
  hover: ["hover:interactive:brightness-110"],
  active: [...BASE_ACTIVE, "active:interactive:brightness-95"],
} as const;

const OUTLINE_INTERACTION_SET = {
  focus: [...BASE_FOCUS, "focus-visible:interactive:ring-input"],
  hover: ["hover:interactive:border-ring", "hover:interactive:bg-muted/5"],
  active: [...BASE_ACTIVE, "active:interactive:bg-muted/10"],
} as const;

export const inputCompoundInteractionCln = {
  [INPUT_COMPOUND_INTERACTION.PRIMARY_IDLE_FOCUS]: [
    ...BASE_FOCUS,
    "focus-visible:interactive:ring-ctp-mauve",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_IDLE_HOVER]: [
    "hover:interactive:border-ctp-mauve",
    "hover:interactive:bg-ctp-mauve/5",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_IDLE_ACTIVE]: [
    ...BASE_ACTIVE,
    "active:interactive:bg-ctp-mauve/10",
  ],

  [INPUT_COMPOUND_INTERACTION.PRIMARY_ERROR_FOCUS]: [
    ...BASE_FOCUS,
    "focus-visible:interactive:ring-destructive",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_ERROR_HOVER]: [
    "hover:interactive:border-destructive",
    "hover:interactive:bg-destructive/5",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_ERROR_ACTIVE]: [
    ...BASE_ACTIVE,
    "active:interactive:bg-destructive/10",
  ],

  [INPUT_COMPOUND_INTERACTION.PRIMARY_SUCCESS_FOCUS]: [
    ...BASE_FOCUS,
    "focus-visible:interactive:ring-ctp-teal",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_SUCCESS_HOVER]: [
    "hover:interactive:border-ctp-teal",
    "hover:interactive:bg-ctp-teal/5",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_SUCCESS_ACTIVE]: [
    ...BASE_ACTIVE,
    "active:interactive:bg-ctp-teal/10",
  ],

  [INPUT_COMPOUND_INTERACTION.PRIMARY_WARNING_FOCUS]: [
    ...BASE_FOCUS,
    "focus-visible:interactive:ring-ctp-peach",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_WARNING_HOVER]: [
    "hover:interactive:border-ctp-peach",
    "hover:interactive:bg-ctp-peach/5",
  ],
  [INPUT_COMPOUND_INTERACTION.PRIMARY_WARNING_ACTIVE]: [
    ...BASE_ACTIVE,
    "active:interactive:bg-ctp-peach/10",
  ],

  [INPUT_COMPOUND_INTERACTION.SECONDARY_IDLE_FOCUS]:
    SECONDARY_INTERACTION_SET.focus,
  [INPUT_COMPOUND_INTERACTION.SECONDARY_IDLE_HOVER]:
    SECONDARY_INTERACTION_SET.hover,
  [INPUT_COMPOUND_INTERACTION.SECONDARY_IDLE_ACTIVE]:
    SECONDARY_INTERACTION_SET.active,

  [INPUT_COMPOUND_INTERACTION.SECONDARY_ERROR_FOCUS]:
    SECONDARY_INTERACTION_SET.focus,
  [INPUT_COMPOUND_INTERACTION.SECONDARY_ERROR_HOVER]:
    SECONDARY_INTERACTION_SET.hover,
  [INPUT_COMPOUND_INTERACTION.SECONDARY_ERROR_ACTIVE]:
    SECONDARY_INTERACTION_SET.active,

  [INPUT_COMPOUND_INTERACTION.SECONDARY_SUCCESS_FOCUS]:
    SECONDARY_INTERACTION_SET.focus,
  [INPUT_COMPOUND_INTERACTION.SECONDARY_SUCCESS_HOVER]:
    SECONDARY_INTERACTION_SET.hover,
  [INPUT_COMPOUND_INTERACTION.SECONDARY_SUCCESS_ACTIVE]:
    SECONDARY_INTERACTION_SET.active,

  [INPUT_COMPOUND_INTERACTION.SECONDARY_WARNING_FOCUS]:
    SECONDARY_INTERACTION_SET.focus,
  [INPUT_COMPOUND_INTERACTION.SECONDARY_WARNING_HOVER]:
    SECONDARY_INTERACTION_SET.hover,
  [INPUT_COMPOUND_INTERACTION.SECONDARY_WARNING_ACTIVE]:
    SECONDARY_INTERACTION_SET.active,

  [INPUT_COMPOUND_INTERACTION.OUTLINE_IDLE_FOCUS]:
    OUTLINE_INTERACTION_SET.focus,
  [INPUT_COMPOUND_INTERACTION.OUTLINE_IDLE_HOVER]:
    OUTLINE_INTERACTION_SET.hover,
  [INPUT_COMPOUND_INTERACTION.OUTLINE_IDLE_ACTIVE]:
    OUTLINE_INTERACTION_SET.active,

  [INPUT_COMPOUND_INTERACTION.OUTLINE_ERROR_FOCUS]:
    OUTLINE_INTERACTION_SET.focus,
  [INPUT_COMPOUND_INTERACTION.OUTLINE_ERROR_HOVER]:
    OUTLINE_INTERACTION_SET.hover,
  [INPUT_COMPOUND_INTERACTION.OUTLINE_ERROR_ACTIVE]:
    OUTLINE_INTERACTION_SET.active,

  [INPUT_COMPOUND_INTERACTION.OUTLINE_SUCCESS_FOCUS]:
    OUTLINE_INTERACTION_SET.focus,
  [INPUT_COMPOUND_INTERACTION.OUTLINE_SUCCESS_HOVER]:
    OUTLINE_INTERACTION_SET.hover,
  [INPUT_COMPOUND_INTERACTION.OUTLINE_SUCCESS_ACTIVE]:
    OUTLINE_INTERACTION_SET.active,

  [INPUT_COMPOUND_INTERACTION.OUTLINE_WARNING_FOCUS]:
    OUTLINE_INTERACTION_SET.focus,
  [INPUT_COMPOUND_INTERACTION.OUTLINE_WARNING_HOVER]:
    OUTLINE_INTERACTION_SET.hover,
  [INPUT_COMPOUND_INTERACTION.OUTLINE_WARNING_ACTIVE]:
    OUTLINE_INTERACTION_SET.active,
} satisfies EnsureAllKeys<InputCompoundIteractionType, string[]>;
