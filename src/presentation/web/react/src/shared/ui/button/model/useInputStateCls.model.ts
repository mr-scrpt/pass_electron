import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import type { ButtonStateType } from "../domain/state.type";
import { buttonStateCls } from "../data/state/state.cls";
import { useCompoundStateClass } from "./useCompoundState.model";
import type { ButtonViewType } from "../domain/view.type";

type UseButtonStateClsParams = {
  state: ButtonStateType;
  view: ButtonViewType;
  classNameState?: string;
};

export const useButtonStateCls = (params: UseButtonStateClsParams) => {
  const { state, view, classNameState } = params;

  const compoundState = useCompoundStateClass({ view, state });

  const classes = cvax([], {
    variants: {
      state: buttonStateCls,
    },
  })({
    state: compoundState,
  });

  return { clsState: cn(classes, classNameState) };
};
