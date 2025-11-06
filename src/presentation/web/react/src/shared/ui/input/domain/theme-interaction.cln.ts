import {
  INTERACTION_THEME,
  type InteractionThemeType,
} from "./theme-interaction.type";
import type { EnsureAllKeys } from "@/shared/lib/typescript";

export const focusThemeCln = {
  [INTERACTION_THEME.PRIMARY]: [
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-ctp-mauve",
  ],

  [INTERACTION_THEME.SECONDARY]: [
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-ctp-green",
  ],

  [INTERACTION_THEME.SUCCESS]: [
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-ctp-teal",
  ],

  [INTERACTION_THEME.ATTENTION]: [
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-destructive",
  ],

  [INTERACTION_THEME.WARNING]: [
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-ctp-peach",
  ],

  [INTERACTION_THEME.NONE]: [
    "focus-visible:outline-none",
    "focus-visible:ring-0",
  ],
} satisfies EnsureAllKeys<InteractionThemeType, string[]>;

export const hoverThemeCln = {
  [INTERACTION_THEME.PRIMARY]: [
    "hover:border-ctp-mauve",
    "hover:bg-ctp-mauve/5",
  ],

  [INTERACTION_THEME.SECONDARY]: [
    "hover:border-ctp-green",
    "hover:bg-ctp-green/5",
  ],

  [INTERACTION_THEME.SUCCESS]: ["hover:border-ctp-teal", "hover:bg-ctp-teal/5"],

  [INTERACTION_THEME.ATTENTION]: [
    "hover:border-destructive",
    "hover:bg-destructive/5",
  ],

  [INTERACTION_THEME.WARNING]: [
    "hover:border-ctp-peach",
    "hover:bg-ctp-peach/5",
  ],

  [INTERACTION_THEME.NONE]: [],
} satisfies EnsureAllKeys<InteractionThemeType, string[]>;

export const activeThemeCln = {
  [INTERACTION_THEME.PRIMARY]: [
    "active:scale-[0.99]",
    "active:bg-ctp-mauve/10",
  ],

  [INTERACTION_THEME.SECONDARY]: [
    "active:scale-[0.99]",
    "active:bg-ctp-green/10",
  ],

  [INTERACTION_THEME.SUCCESS]: ["active:scale-[0.99]", "active:bg-ctp-teal/10"],

  [INTERACTION_THEME.ATTENTION]: [
    "active:scale-[0.99]",
    "active:bg-destructive/10",
  ],

  [INTERACTION_THEME.WARNING]: [
    "active:scale-[0.99]",
    "active:bg-ctp-peach/10",
  ],

  [INTERACTION_THEME.NONE]: [],
} satisfies EnsureAllKeys<InteractionThemeType, string[]>;
