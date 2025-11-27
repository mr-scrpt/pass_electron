import { cn } from "@/shared/lib/shadcn";
import type { PageViewType } from "../domain/view/view.type";
import type { PageAppearanceType } from "../domain/appearance/appearance.type";
import { getPageViewCls } from "./view.model";
import { getPageAppearanceCls } from "./appearance.model";

// For <Page> component
type GetPageClsParams = {
  view: PageViewType;
  className?: string;
};

export const getPageCls = (params: GetPageClsParams) => {
  const { view, className } = params;

  return {
    clsPage: cn(
      "w-full",
      getPageViewCls({ view }).clsView,
      className
    ),
  };
};

// For <Page.Section> component
type GetPageSectionClsParams = {
  appearance: PageAppearanceType;
  className?: string;
};

export const getPageSectionCls = (params: GetPageSectionClsParams) => {
  const { appearance, className } = params;

  return {
    clsSection: cn(
      getPageAppearanceCls({ appearance }).clsAppearance,
      className
    ),
  };
};
