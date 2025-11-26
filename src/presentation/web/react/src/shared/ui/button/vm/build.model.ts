import { cn } from "@/shared/lib/shadcn";
import { buttonBaseCls, buttonNativeStateCls } from "../data/base.cls";
import type { ButtonSizeType } from "../domain/size/size.type";
import type { ButtonStateType } from "../domain/state/state.type";
import type { ButtonViewType } from "../domain/view/view.type";
import { getButtonSizeCls } from "./size.model";
import { getButtonStateCls } from "./state.model";
import { getButtonViewCls } from "./view.model";
import { getButtonInteractionCls } from "./interaction.model";

type GetButtonClsParams = {
  size: ButtonSizeType;
  view: ButtonViewType;
  state: ButtonStateType;
  className?: string;
};

export const getButtonCls = (params: GetButtonClsParams) => {
  const { view, size, state, className } = params;

  return {
    clsButton: cn(
      [
        getButtonViewCls({ view }).clsView,
        getButtonSizeCls({ size }).clsSize,
        getButtonStateCls({ state, view }).clsState,
        getButtonInteractionCls({ state, view }).clsInteraction,
      ],
      ...buttonBaseCls,
      ...buttonNativeStateCls,
      className,
    ),
  };
};
