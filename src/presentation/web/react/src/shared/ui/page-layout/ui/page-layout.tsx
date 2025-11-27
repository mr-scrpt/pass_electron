import React from "react";
import { LAYOUT_ORIENTATION } from "../../layout";
import { PAGE_VIEW } from "../../____page";
import type { LayoutOrientationType } from "../../layout";
import type { PageViewType } from "../../____page";
import { getPageLayoutCls } from "../vm/build.model";

type PageLayoutProps = {
  children: React.ReactNode;
  view?: PageViewType;
  orientation?: LayoutOrientationType;
  className?: string;
};

export const PageLayout = (props: PageLayoutProps) => {
  const {
    children,
    view = PAGE_VIEW.PRIMARY,
    orientation = LAYOUT_ORIENTATION.VERTICAL,
    className,
  } = props;

  const { clsPageLayout } = getPageLayoutCls({ view, orientation, className });

  return <body className={clsPageLayout}>{children}</body>;
};
