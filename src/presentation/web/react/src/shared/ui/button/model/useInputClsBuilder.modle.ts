import type { ButtonSizeType } from "../domain/size.type";
import type { ButtonStateType } from "../domain/state.type";
import type { ButtonViewType } from "../domain/view.type";
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
};
