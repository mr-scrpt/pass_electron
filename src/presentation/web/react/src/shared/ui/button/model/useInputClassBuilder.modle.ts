import { cvax } from "@/shared/lib/cvax";
import type { ButtonSizeType } from "../domain/size.type";
import type { ButtonStateType } from "../domain/state.type";
import type { ButtonViewType } from "../domain/view.type";
import { useComputedInteractionClass } from "./useCompoundInteractionClass.model";
import { useCompoundStateClass } from "./useCompoundState.model";
import { buttonBaseCls, buttonNativeStateCls } from "../data/base.cls";
import { buttonViewCls } from "../data/view.cls";
import { buttonSizeCls } from "../data/size.cln";
import { buttonStateCln } from "../data/state/state.cln";
import { buttonInteractionCls } from "../data/interaction/interaction.cln";
import { cn } from "@/shared/lib/shadcn";

type UseButtonBuilderParams = {
  size: ButtonSizeType;
  view: ButtonViewType;
  state: ButtonStateType;
  className?: string;
};

export const useButtonClassBuilder = (params: UseButtonBuilderParams) => {
  const { view, size, state, className } = params;

  const compoundState = useCompoundStateClass({ view, state });
  const compoundInteraction = useComputedInteractionClass({ view, state });

  const classes = cvax([...buttonBaseCls, ...buttonNativeStateCls], {
    variants: {
      view: buttonViewCls,
      size: buttonSizeCls,
      state: buttonStateCln,
    },
    multiVariants: {
      interaction: buttonInteractionCls,
    },
  })({
    view,
    size,
    state: compoundState,
    interaction: compoundInteraction,
  });

  return cn(classes, className);
};
