import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { buttonStateCls } from "../data/state/state.cls";
import type { ButtonStateType } from "../domain/state/state.type";
import type { ButtonViewType } from "../domain/view/view.type";
import { getCompositeState } from "../domain/composite-state/composite-state";

type GetButtonStateClsParams = {
  state: ButtonStateType;
  view: ButtonViewType;
  classNameState?: string;
};

export const getButtonStateCls = (params: GetButtonStateClsParams) => {
  const { state, view, classNameState } = params;

  const composeState = getCompositeState({ view, state });

  const classes = cvax({
    variants: {
      state: buttonStateCls,
    },
  })({
    state: composeState,
  });

  return { clsState: cn(classes, classNameState) };
};
