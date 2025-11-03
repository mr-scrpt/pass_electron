import { ResourceList } from "@/features/resourceList";
import type { ComponentProps } from "react";

type MainPageProps = ComponentProps<"main">;

export const PageMain = (props: MainPageProps) => {
  const { className } = props;

  return (
    <main>
      <ResourceList />
    </main>
  );
};

// export default PageMain;
