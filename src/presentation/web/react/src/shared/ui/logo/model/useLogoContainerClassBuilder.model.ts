import { cn } from "@/shared/lib/shadcn";
import { logoBaseCls } from "../data/base.cls";

type UseLogoContainerClassBuilderParams = {
    className?: string;
    animate?: boolean;
};

/**
 * Hook for building logo container classes
 */
export const useLogoContainerClassBuilder = (
    params: UseLogoContainerClassBuilderParams,
): string => {
    const { className, animate } = params;

    return cn(logoBaseCls, animate && "group", className);
};
