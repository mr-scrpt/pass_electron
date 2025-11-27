import type { ComponentProps } from "react";
import { PAGE_VIEW } from "../domain/view/view.const";
import type { PageViewType } from "../domain/view/view.type";
import { getPageCls } from "../vm/build.model";

type PageProps = ComponentProps<"main"> & {
  view?: PageViewType;
};
export const Page = (props: PageProps) => {
  const { view = PAGE_VIEW.PRIMARY, className, children, ...rest } = props;

  const { clsPage } = getPageCls({ view, className });

  return (
    <main className={clsPage} {...rest}>
      {children}
    </main>
  );
};
