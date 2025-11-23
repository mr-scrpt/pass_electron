import type { ComponentProps, ElementType, FC } from "react";
import { SECTION_AREA, type SectionAreaType } from "../domain/area.type";
import { SECTION_GAP, type SectionGapType } from "../domain/gap.type";
import { useSectionClassBuilder } from "../model/useSectionClassBuilder.model";
import { sectionBaseCls } from "../data/base.cls";
import { cn } from "@/shared/lib/shadcn";

type RowSectionProps = ComponentProps<"section"> & {
  area?: SectionAreaType;
  gap?: SectionGapType;
  classSection?: string;
  classInner?: string;
  classContent?: string;
  as?: ElementType;
};

export const RowSection: FC<RowSectionProps> = (props) => {
  const {
    children,
    classSection,
    area = SECTION_AREA.CONTAINER,
    gap = SECTION_GAP.PRIMARY,
    classInner,
    as: Component = "div",
    ...rest
  } = props;

  const clsSection = cn(sectionBaseCls, classSection);
  const clsInner = useSectionClassBuilder({ gap, area, className: classInner });
  return (
    <Component className={clsSection} {...rest}>
      <div className={clsInner}>{children}</div>
    </Component>
  );
};
