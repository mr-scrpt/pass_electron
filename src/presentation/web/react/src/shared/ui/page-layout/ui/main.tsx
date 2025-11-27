import type { ComponentProps } from "react";
import { LAYOUT_BEHAVIOR } from "../../layout";
import { PAGE_APPEARANCE } from "../../____page";
import type { PageAppearanceType } from "../../____page";
import { getPageLayoutSectionCls } from "../vm/build.model";
import { cn } from "@/shared/lib/shadcn";

type MainProps = Omit<ComponentProps<"main">, "appearance"> & {
  appearance?: PageAppearanceType;
};

export const Main = (props: MainProps) => {
  const {
    appearance = PAGE_APPEARANCE.DEFAULT,
    className,
    ...rest
  } = props;

  const { clsPageLayoutSection } = getPageLayoutSectionCls({
    behavior: LAYOUT_BEHAVIOR.FLUID,
    appearance,
    className: cn("overflow-y-auto", className),
  });

  return <main className={clsPageLayoutSection} {...rest} />;
};
