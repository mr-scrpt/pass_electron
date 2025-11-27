import type { ComponentProps, ElementType } from "react";
import { getPageSectionCls } from "../vm/build.model";
import { PAGE_APPEARANCE } from "../domain/appearance/appearance.const";
import type { PageAppearanceType } from "../domain/appearance/appearance.type";

type SectionProps = ComponentProps<"section"> & {
  appearance?: PageAppearanceType;
  as?: ElementType;
};

export const Section = (props: SectionProps) => {
  const {
    appearance = PAGE_APPEARANCE.DEFAULT,
    className,
    as: Component = "section",
    ...rest
  } = props;

  const { clsSection } = getPageSectionCls({ appearance, className });

  return <Component className={clsSection} {...rest} />;
};
