import {
  resolveCompoundState,
  resolveCompoundInteractionStates,
} from "@/shared/lib/compound-state-resolver";
import { inputCompoundStateCln } from "../domain/compound-state.cln";
import { inputCompoundInteractionCln } from "../domain/compound-interaction.cln";
import { inputCompoundStateMapping } from "../domain/compound.config";
import type { InputStateType } from "../domain/state.type";
import type { InputViewType } from "../domain/view.type";
import { INTERACTION_ARRAY } from "../domain/compound-interaction.type";

type ResolveInputThemeParams = {
  view: InputViewType;
  state: InputStateType;
};

/**
 * Резолвит стили для compound state (VIEW + STATE)
 */
function resolveCompoundStateStyles(
  view: InputViewType,
  state: InputStateType,
): readonly string[] {
  const compoundState = resolveCompoundState(inputCompoundStateMapping, {
    view,
    state,
  });
  return inputCompoundStateCln[compoundState];
}

/**
 * Резолвит стили для compound interaction (VIEW + STATE + INTERACTION)
 */
function resolveCompoundInteractionStyles(
  view: InputViewType,
  state: InputStateType,
): readonly string[] {
  const interactionKeys = resolveCompoundInteractionStates(
    inputCompoundStateMapping,
    { view, state },
    INTERACTION_ARRAY
  );

  return interactionKeys.flatMap((key) => inputCompoundInteractionCln[key]);
}

/**
 * Резолвит все стили темы для Input
 */
export function resolveInputTheme(
  params: ResolveInputThemeParams,
): readonly string[] {
  const { view, state } = params;

  const stateStyles = resolveCompoundStateStyles(view, state);
  const interactionStyles = resolveCompoundInteractionStyles(view, state);

  return [...stateStyles, ...interactionStyles];
}
