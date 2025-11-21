import { cn } from "@/shared/lib/shadcn";
import { cvax } from "@/shared/lib/cvax";
import type { InputSizeType } from "../domain/size.type";
import type { InputStateType } from "../domain/state.type";
import { inputViewCln } from "../data/view.cln";
import type { InputViewType } from "../domain/view.type";
import { useCompoundInteractionClass } from "./useCompoundInteractionClass.model";
import { useCompoundStateClass } from "./useCompoundStateClass.model";
import { inputBaseCls, inputNativeStateCls } from "../data/base.cls";
import { inputSizeCln } from "../data/size.cln";
import { inputInteractionCln } from "../data/interaction/interaction.cln";
import { inputStateCln } from "../data/state/state.cln";

type UseInputClassBuilderParams = {
  view: InputViewType;
  size: InputSizeType;
  state: InputStateType;
  className?: string;
};

export const useInputClassBuilder = (
  params: UseInputClassBuilderParams,
): string => {
  const { view, size, state, className } = params;
  const compoundState = useCompoundStateClass({ view, state });
  const compoundInteraction = useCompoundInteractionClass({ view, state });

  const classes = cvax([...inputBaseCls, ...inputNativeStateCls], {
    variants: {
      view: inputViewCln,
      size: inputSizeCln,
      state: inputStateCln,
    },
    multiVariants: {
      interaction: inputInteractionCln,
    },
  })({
    view,
    size,
    state: compoundState,
    interaction: compoundInteraction,
  });

  return cn(classes, className);
};
