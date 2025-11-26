// import { cvax } from "@/shared/lib/cvax";
import type { ButtonSizeType } from "../domain/size.type";
import type { ButtonStateType } from "../domain/state.type";
import type { ButtonViewType } from "../domain/view.type";
// import { useComputedInteractionClass } from "./useCompoundInteractionClass.model";
// import { useCompoundStateClass } from "./useCompoundState.model";
// import { buttonBaseCls, buttonNativeStateCls } from "../data/base.cls";
// import { buttonViewCls } from "../data/view.cls";
// import { buttonSizeCls } from "../data/size.cln";
// import { buttonStateCls } from "../data/state/state.cls";
// import { buttonInteractionCls } from "../data/interaction/interaction.cln";
import { cn } from "@/shared/lib/shadcn";
import { useButtonViewCls } from "./useInputViewCls.model";
import { useButtonSizeCls } from "./useInputSizeCls.model";
import { useButtonStateCls } from "./useInputStateCls.model";
import { useButtonInteractionCls } from "./useInputInteractionCls.model";
import { buttonBaseCls, buttonNativeStateCls } from "../data/base.cls";

type UseButtonBuilderParams = {
  size: ButtonSizeType;
  view: ButtonViewType;
  state: ButtonStateType;
  className?: string;
};

export const useButtonClassBuilder = (params: UseButtonBuilderParams) => {
  const { view, size, state, className } = params;

  // const compoundState = useCompoundStateClass({ view, state });
  // const compoundInteraction = useComputedInteractionClass({ view, state });

  return {
    clsButton: cn(
      [
        useButtonViewCls({ view }).clsView,
        useButtonSizeCls({ size }).clsSize,
        useButtonStateCls({ state, view }).clsState,
        useButtonInteractionCls({ state, view }).clsInteraction,
      ],
      ...buttonBaseCls,
      ...buttonNativeStateCls,
      className,
    ),
  };

  // const classes = cvax([...buttonBaseCls, ...buttonNativeStateCls], {
  //   variants: {
  //     view: buttonViewCls,
  //     size: buttonSizeCls,
  //     state: buttonStateCls,
  //   },
  //   multiVariants: {
  //     interaction: buttonInteractionCls,
  //   },
  // })({
  //   view,
  //   size,
  //   state: compoundState,
  //   interaction: compoundInteraction,
  // });

  // return cn(classes, className);
};
