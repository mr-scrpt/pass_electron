import React, { Children, isValidElement } from "react";
import { LAYOUT_BEHAVIOR, LAYOUT_ORIENTATION } from "../../layout";
import { PAGE_APPEARANCE, PAGE_VIEW } from "../../____page";
import type { LayoutOrientationType } from "../../layout";
import type { PageViewType } from "../../____page";
import { Section as PageLayoutSection } from "./section";
import type { PageLayoutSectionProps } from "./section";
import {
  getPageLayoutCls,
  getPageLayoutSectionCls,
} from "../vm/build.model";

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

  const transformedChildren = Children.map(children, (child) => {
    if (
      !isValidElement(child) ||
      (child.type as React.FC) !== PageLayoutSection
    ) {
      return child;
    }

    const sectionProps = child.props as PageLayoutSectionProps;
    const {
      behavior = LAYOUT_BEHAVIOR.FIXED,
      appearance = PAGE_APPEARANCE.DEFAULT,
      className: sectionClassName,
      children: sectionChildren,
    } = sectionProps;

    const { clsPageLayoutSection } = getPageLayoutSectionCls({
      behavior,
      appearance,
      className: sectionClassName,
    });

    return <section className={clsPageLayoutSection}>{sectionChildren}</section>;
  });

  return <main className={clsPageLayout}>{transformedChildren}</main>;
};
