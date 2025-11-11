import { cn } from "@/shared/lib/shadcn";
import { cvax } from "@/shared/lib/cvax";
import { inputBaseCln } from "../domain/base";
import { inputCompoundInteractionCln } from "../domain/compound-interaction.cln";
import { inputCompoundStateCln } from "../domain/compound-state.cln";
import { inputNativeStateCln } from "../domain/native-state.cln";
import { inputSizeCln } from "../domain/size.cln";
import type { InputSizeType } from "../domain/size.type";
import type { InputStateType } from "../domain/state.type";
import { inputViewCln } from "../domain/view.cln";
import type { InputViewType } from "../domain/view.type";
import { useCompoundInteractionClass } from "./useCompoundInteractionClass.model";
import { useCompoundStateClass } from "./useStateClass.model";

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
