import type { ComponentProps } from "react";
import { LAYOUT_BEHAVIOR } from "../../layout";
import { PAGE_APPEARANCE } from "../../____page";
import type { PageAppearanceType } from "../../____page";
import { getPageLayoutSectionCls } from "../vm/build.model";

type FooterProps = Omit<ComponentProps<"footer">, "appearance"> & {
  appearance?: PageAppearanceType;
};

export const Footer = (props: FooterProps) => {
  const {
    appearance = PAGE_APPEARANCE.SURFACE,
    className,
    ...rest
  } = props;

  const { clsPageLayoutSection } = getPageLayoutSectionCls({
    behavior: LAYOUT_BEHAVIOR.FIXED,
    appearance,
    className,
  });

  return <footer className={clsPageLayoutSection} {...rest} />;
};
