import type { ComponentProps, ElementType, FC } from "react";
import { SECTION_AREA } from "../domain/area/area.const";
import type { SectionAreaType } from "../domain/area/area.type";
import { SECTION_DECO } from "../domain/deco/deco.const";
import type { SectionDecoType } from "../domain/deco/deco.type";
import { SECTION_GAP } from "../domain/gap/gap.const";
import type { SectionGapType } from "../domain/gap/gap.type";
import { SECTION_VIEW } from "../domain/view/view.const";
import type { SectionViewType } from "../domain/view/view.type";
import { getSectionCls } from "../vm/build.model";

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

  const { clsSectionInner, clsSectionRoot } = getSectionCls({
    gap,
    area,
    deco,
    view,
    classNameInner,
    classNameRoot: className,
  });
  return (
    <Component className={clsSectionRoot} {...rest}>
      <div className={clsSectionInner}>{children}</div>
    </Component>
  );
};
