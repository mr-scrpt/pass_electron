import { cn } from "@/shared/lib/shadcn";
import type { LogoSizeType } from "../domain/size.type";
import type { LogoViewType } from "../domain/view.type";
import { logoSizeCln } from "../data/size.cln";
import { logoViewCln } from "../data/view.cln";
import { logoIconBaseCls } from "../data/base.cls";

type UseLogoIconClassBuilderParams = {
    size: LogoSizeType;
    view: LogoViewType;
};

/**
 * Hook for building icon container classes
 */
export const useLogoIconClassBuilder = (
    params: UseLogoIconClassBuilderParams,
): string => {
    const { size, view } = params;

    return cn(logoIconBaseCls, logoSizeCln[size], logoViewCln[view]);
};
