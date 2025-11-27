import { cn } from "@/shared/lib/shadcn";
import { getLayoutCls, getLayoutAreaCls } from "../../layout/vm/build.model";
import { getPageCls, getPageSectionCls } from "../../____page/vm/build.model";

import type { LayoutOrientationType } from "../../layout";
import type { PageViewType, PageAppearanceType } from "../../____page";
import type { LayoutBehaviorType } from "../../layout";

// For <PageLayout> component
type GetPageLayoutClsParams = {
  orientation: LayoutOrientationType;
  view: PageViewType;
  className?: string;
};

export const getPageLayoutCls = (params: GetPageLayoutClsParams) => {
  const { orientation, view, className } = params;

  const { clsLayout } = getLayoutCls({ orientation });
  const { clsPage } = getPageCls({ view });

  return {
    clsPageLayout: cn(clsLayout, clsPage, className),
  };
};

// For <PageLayout.Section> component
type GetPageLayoutSectionClsParams = {
  behavior: LayoutBehaviorType;
  appearance: PageAppearanceType;
  className?: string;
};

export const getPageLayoutSectionCls = (
  params: GetPageLayoutSectionClsParams,
) => {
  const { behavior, appearance, className } = params;

  const { clsArea } = getLayoutAreaCls({ behavior });
  const { clsSection } = getPageSectionCls({ appearance });

  return {
    clsPageLayoutSection: cn(clsArea, clsSection, className),
  };
};
