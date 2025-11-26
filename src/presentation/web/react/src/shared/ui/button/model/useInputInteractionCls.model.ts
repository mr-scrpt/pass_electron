import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { buttonInteractionCls } from "../data/interaction/interaction.cln";
import { useComputedInteractionClass } from "./useCompoundInteractionClass.model";
import type { ButtonViewType } from "../domain/view.type";
import type { ButtonStateType } from "../domain/state.type";

type UseButtonInteractionClsParams = {
  view: ButtonViewType;
  state: ButtonStateType;
  classNameInteraction?: string;
};

export const useButtonInteractionCls = (
  params: UseButtonInteractionClsParams,
) => {
  const { view, state, classNameInteraction } = params;
  const compoundInteraction = useComputedInteractionClass({ view, state });

  const classes = cvax([], {
    variants: {},
    multiVariants: {
      interaction: buttonInteractionCls,
    },
  })({
    interaction: compoundInteraction,
  });

  return { clsInteraction: cn(classes, classNameInteraction) };
};
