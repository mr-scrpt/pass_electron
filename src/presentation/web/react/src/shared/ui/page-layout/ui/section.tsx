import type { ReactNode } from "react";
import type { LayoutBehaviorType } from "../../layout";
import type { PageAppearanceType } from "../../____page";

export type PageLayoutSectionProps = {
  children: ReactNode;
  behavior?: LayoutBehaviorType;
  appearance?: PageAppearanceType;
  className?: string;
};

// This component is a data carrier. It doesn't render any DOM element itself.
// The parent PageLayout will read its props and children to construct the actual layout.
export const Section = (props: PageLayoutSectionProps) => {
  return <>{props.children}</>;
};
