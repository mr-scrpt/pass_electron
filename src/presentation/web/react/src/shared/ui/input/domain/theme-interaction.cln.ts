import {
  INTERACTION_THEME,
  type InteractionThemeType,
} from "./theme-interaction.type";
import type { EnsureAllKeys } from "@/shared/lib/typescript";

/**
 * Темы интерактивности для Input
 *
 * Используют custom variant "interactive" из variants.css
 * который исключает disabled и readonly состояния
 *
 * @see @/shared/styles/variants.css - определение custom variants
 */

export const focusThemeCln = {
  [INTERACTION_THEME.PRIMARY]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-ctp-mauve",
  ],

  [INTERACTION_THEME.SECONDARY]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-ctp-green",
  ],

  [INTERACTION_THEME.SUCCESS]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-ctp-teal",
  ],

  [INTERACTION_THEME.ATTENTION]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-destructive",
  ],

  [INTERACTION_THEME.WARNING]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-2",
    "focus-visible:interactive:ring-ctp-peach",
  ],

  [INTERACTION_THEME.NONE]: [
    "focus-visible:interactive:outline-none",
    "focus-visible:interactive:ring-0",
  ],
} satisfies EnsureAllKeys<InteractionThemeType, string[]>;

export const hoverThemeCln = {
  [INTERACTION_THEME.PRIMARY]: [
    "hover:interactive:border-ctp-mauve",
    "hover:interactive:bg-ctp-mauve/5",
  ],

  [INTERACTION_THEME.SECONDARY]: [
    "hover:interactive:border-ctp-green",
    "hover:interactive:bg-ctp-green/5",
  ],

  [INTERACTION_THEME.SUCCESS]: [
    "hover:interactive:border-ctp-teal",
    "hover:interactive:bg-ctp-teal/5",
  ],

  [INTERACTION_THEME.ATTENTION]: [
    "hover:interactive:border-destructive",
    "hover:interactive:bg-destructive/5",
  ],

  [INTERACTION_THEME.WARNING]: [
    "hover:interactive:border-ctp-peach",
    "hover:interactive:bg-ctp-peach/5",
  ],

  [INTERACTION_THEME.NONE]: [],
} satisfies EnsureAllKeys<InteractionThemeType, string[]>;

export const activeThemeCln = {
  [INTERACTION_THEME.PRIMARY]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:bg-ctp-mauve/10",
  ],

  [INTERACTION_THEME.SECONDARY]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:bg-ctp-green/10",
  ],

  [INTERACTION_THEME.SUCCESS]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:bg-ctp-teal/10",
  ],

  [INTERACTION_THEME.ATTENTION]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:bg-destructive/10",
  ],

  [INTERACTION_THEME.WARNING]: [
    "active:interactive:scale-[0.99]",
    "active:interactive:bg-ctp-peach/10",
  ],

  [INTERACTION_THEME.NONE]: [],
} satisfies EnsureAllKeys<InteractionThemeType, string[]>;
