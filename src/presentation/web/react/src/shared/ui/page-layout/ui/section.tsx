import type { ComponentProps } from "react";
import { PAGE_APPEARANCE } from "../../____page";
import type { PageAppearanceType } from "../../____page";
import { getPageSectionCls } from "../../____page/vm/build.model";

type SectionProps = Omit<ComponentProps<"section">, "appearance"> & {
  appearance?: PageAppearanceType;
};

export const Section = (props: SectionProps) => {
  const {
    appearance = PAGE_APPEARANCE.DEFAULT,
    className,
    ...rest
  } = props;

  const { clsSection } = getPageSectionCls({
    appearance,
    className,
  });

  return <section className={clsSection} {...rest} />;
};
