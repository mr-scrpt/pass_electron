import { cvax } from "@/shared/lib/cvax";
import { cn } from "@/shared/lib/shadcn";
import { buttonInteractionCls } from "../data/interaction/interaction.cls";
import type { ButtonStateType } from "../domain/state/state.type";
import type { ButtonViewType } from "../domain/view/view.type";
import { getCompositeInteraction } from "../domain/composite-interaction/composite-interaction";

type GetButtonInteractionClsParams = {
  view: ButtonViewType;
  state: ButtonStateType;
  classNameInteraction?: string;
};

export const getButtonInteractionCls = (
  params: GetButtonInteractionClsParams,
) => {
  const { view, state, classNameInteraction } = params;
  const compositeInteraction = getCompositeInteraction({ view, state });

  const classes = cvax([], {
    variants: {},
    multiVariants: {
      interaction: buttonInteractionCls,
    },
  })({
    interaction: compositeInteraction,
  });

  return { clsInteraction: cn(classes, classNameInteraction) };
};
