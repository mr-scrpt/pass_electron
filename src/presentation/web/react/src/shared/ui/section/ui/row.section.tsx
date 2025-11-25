import type { ComponentProps, ElementType, FC } from "react";
import { SECTION_AREA, type SectionAreaType } from "../domain/area.type";
import { SECTION_DECO, type SectionDecoType } from "../domain/deco.type";
import { SECTION_GAP, type SectionGapType } from "../domain/gap.type";
import { SECTION_VIEW, type SectionViewType } from "../domain/view.type";
import { useSectionClsBuilder } from "../model/useSectionClsBuilder.model";

type RowSectionProps = ComponentProps<"section"> & {
  area?: SectionAreaType;
  gap?: SectionGapType;

  deco?: SectionDecoType;
  view?: SectionViewType;
  classSection?: string;
  classNameInner?: string;
  as?: ElementType;
};

export const RowSection: FC<RowSectionProps> = (props) => {
  const {
    children,
    area = SECTION_AREA.CONTAINER,
    gap = SECTION_GAP.PRIMARY,
    deco = SECTION_DECO.BDR_CUP,
    view = SECTION_VIEW.PRIMARY,
    classNameInner,
    className,
    as: Component = "section",
    ...rest
  } = props;

  const { clsSectionInner, clsSectionRoot } = useSectionClsBuilder({
    gap,
    area,
    deco,
    view,
    classNameInner,
    classNameRoot: className,
  });
  console.log("output_log:  =>>>", clsSectionRoot);
  return (
    <Component className={clsSectionRoot} {...rest}>
      <div className={clsSectionInner}>{children}</div>
    </Component>
  );
};
