import { cvax } from "@/shared/lib/cvax";
import type { ButtonSizeType } from "../domain/size.type";
import type { ButtonStateType } from "../domain/state.type";
import type { ButtonViewType } from "../domain/view.type";
import { useComputedInteractionClass } from "./useCompoundInteractionClass.model";
import { useCompoundStateClass } from "./useCompoundState.model";
import { buttonBaseCln } from "../data/base.clse.clse

type UseButtonBuilderParams = {
  size: ButtonSizeType;
  view: ButtonViewType;
  state: ButtonStateType;
  className: string;
};

export const useButtonClassBuilder = (params: UseButtonBuilderParams) => {
  const { view, size, state, className } = params;

  const compoundState = useCompoundStateClass({ view, state });
  const compoundInteraction = useComputedInteractionClass({ view, state });

  const classes = cvax([...buttonBaseCln], {
    variants: {
      view: buttonViewCln,
    },
  });
};
