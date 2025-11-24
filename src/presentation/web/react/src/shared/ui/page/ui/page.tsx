import type { ComponentProps } from "react";
import { PAGE_VIEW, type PageViewType } from "../domain/view.type";
import { usePageClassBuilder } from "../model/usePageClassBuilder.model";

type PageProps = ComponentProps<"main"> & {
  view?: PageViewType;
};
export const Page = (props: PageProps) => {
  const { view = PAGE_VIEW.PRIMARY, children } = props;

  const clsPage = usePageClassBuilder({ view });

  return <main className={clsPage}>{children}</main>;
};
