import type { ComponentProps } from "react";
import { LAYOUT_BEHAVIOR } from "../../layout";
import { PAGE_APPEARANCE } from "../../____page";
import type { PageAppearanceType } from "../../____page";
import { getPageLayoutSectionCls } from "../vm/build.model";

type HeaderProps = Omit<ComponentProps<"header">, "appearance"> & {
  appearance?: PageAppearanceType;
};

export const Header = (props: HeaderProps) => {
  const {
    appearance = PAGE_APPEARANCE.TRANSPARENT,
    className,
    ...rest
  } = props;

  const { clsPageLayoutSection } = getPageLayoutSectionCls({
    behavior: LAYOUT_BEHAVIOR.FIXED,
    appearance,
    className,
  });

  return <header className={clsPageLayoutSection} {...rest} />;
};
