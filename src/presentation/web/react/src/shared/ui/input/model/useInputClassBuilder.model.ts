import { cn } from "@/shared/lib/shadcn";
import { cvax } from "@/shared/lib/cvax";
import type { InputSizeType } from "../domain/size.type";
import type { InputStateType } from "../domain/state.type";
import { inputViewCln } from "../data/view.cln";
import type { InputViewType } from "../domain/view.type";
import { useCompoundInteractionClass } from "./useCompoundInteractionClass.model";
import { useCompoundStateClass } from "./useStateClass.model";
import { inputBaseCln, inputNativeStateCln } from "../data/base";
import { inputCompoundInteractionCln } from "../data/compound-interaction.cln";
import { inputCompoundStateCln } from "../data/compound-state.cln";
import { inputSizeCln } from "../data/size.cln";

type UseInputClassBuilderParams = {
  view: InputViewType;
  size: InputSizeType;
  state: InputStateType;
  className?: string;
};

export function useInputClassBuilder(
  params: UseInputClassBuilderParams,
): string {
  const { view, size, state, className } = params;
  const compoundState = useCompoundStateClass({ view, state });
  const compoundInteraction = useCompoundInteractionClass({ view, state });

  const classes = cvax([...inputBaseCln, ...inputNativeStateCln], {
    variants: {
      view: inputViewCln,
      size: inputSizeCln,
      state: inputCompoundStateCln,
    },
    multiVariants: {
      interaction: inputCompoundInteractionCln,
    },
  })({
    view,
    size,
    state: compoundState,
    interaction: compoundInteraction,
  });

  return cn(classes, className);
}
