import { resolveCompoundState } from "@/shared/lib/compound-state-resolver";
import { inputCompoundStateBehaviorCln } from "../domain/compound-state-behavior.cln";
import { inputCompoundStateCln } from "../domain/compound-state.cln";
import { inputCompoundStateMapping } from "../domain/compound.config";
import type { InputStateType } from "../domain/state.type";
import {
  activeThemeCln,
  focusThemeCln,
  hoverThemeCln,
} from "../domain/theme-interaction.cln";
import type { InputViewType } from "../domain/view.type";

type ResolveInputThemeParams = {
  view: InputViewType;
  state: InputStateType;
};

type ResolvedInputTheme = {
  static: string[];
  focus: string[];
  hover: string[];
  active: string[];
};

export function resolveInputTheme(
  params: ResolveInputThemeParams,
): ResolvedInputTheme {
  const compoundState = resolveCompoundState(inputCompoundStateMapping, params);

  const staticStyles = inputCompoundStateCln[compoundState];

  const behavior = inputCompoundStateBehaviorCln[compoundState];

  const focusClasses = focusThemeCln[behavior.focus];
  const hoverClasses = hoverThemeCln[behavior.hover];
  const activeClasses = activeThemeCln[behavior.active];

  return {
    static: staticStyles,
    focus: focusClasses,
    hover: hoverClasses,
    active: activeClasses,
  };
}

export function getInputThemeClasses(theme: ResolvedInputTheme): string[] {
  return [...theme.static, ...theme.focus, ...theme.hover, ...theme.active];
}
