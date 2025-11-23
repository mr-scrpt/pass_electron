import { cn } from "@/shared/lib/shadcn";
import type { LogoViewType } from "../domain/view.type";
import { logoTextBaseCls } from "../data/base.cls";
import { logoTextColorCln } from "../data/text-color.cln";
import { logoTextAnimationCls } from "../data/animation.cls";

type UseLogoTextClassBuilderParams = {
    view: LogoViewType;
    animate: boolean;
};

/**
 * Hook for building logo text classes
 */
export const useLogoTextClassBuilder = (
    params: UseLogoTextClassBuilderParams,
): string => {
    const { view, animate } = params;

    return cn(
        logoTextBaseCls,
        logoTextColorCln[view],
        animate && logoTextAnimationCls,
    );
};
