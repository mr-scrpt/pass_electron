import { ResourceList } from "@/features/resourceList";
import { Button } from "@/shared/ui/shadcn/button";
import { Input } from "@/shared/ui/shadcn/input";
import type { ComponentProps } from "react";

type MainPageProps = ComponentProps<"main">;

export const PageMain = (props: MainPageProps) => {
  const { className } = props;

  return (
    <main>
      <Input />
      <Button>Button text</Button>
      <Button variant="secondary">Button text</Button>
      <Button variant="outline">Button</Button>
      <ResourceList />
    </main>
  );
};

// export default PageMain;
