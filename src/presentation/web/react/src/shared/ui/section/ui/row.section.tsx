import type { ComponentProps, ElementType, FC } from "react";
import { SECTION_AREA, type SectionAreaType } from "../domain/area.type";
import { SECTION_GAP, type SectionGapType } from "../domain/gap.type";
import { sectionBaseCls } from "../data/base.cls";
import { cn } from "@/shared/lib/shadcn";
import { SECTION_DECO, type SectionDecoType } from "../domain/deco.type";
import { SECTION_VIEW, type SectionViewType } from "../domain/view.type";
import { useSectionInnerClsBuilder } from "../model/useSectionInnerClsBuilder.model";

type RowSectionProps = ComponentProps<"section"> & {
  area?: SectionAreaType;
  gap?: SectionGapType;

  deco?: SectionDecoType;
  view?: SectionViewType;
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
    deco = SECTION_DECO.BDR_CUP,
    view = SECTION_VIEW.PRIMARY,
    classInner,
    as: Component = "section",
    ...rest
  } = props;

  const clsSectionRoot = cn(sectionBaseCls, classSection);

  const { clsSectionInner } = useSectionInnerClsBuilder({
    gap,
    area,
    deco,
    view,
    className: classInner,
  });
  return (
    <Component className={clsSectionRoot} {...rest}>
      <div className={clsSectionInner}>{children}</div>
    </Component>
  );
};
