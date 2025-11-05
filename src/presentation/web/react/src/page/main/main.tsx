import { ResourceList } from "@/features/resourceList";
import { INPUT_SIZE, INPUT_VIEW } from "@/shared/ui/input";
import { INPUT_STATE } from "@/shared/ui/input/domain/state.type";
import { Input } from "@/shared/ui/input/ui/input";
// import { Button } from "@/shared/ui/shadcn/button";
import type { ComponentProps } from "react";

type MainPageProps = ComponentProps<"main">;

export const PageMain = (props: MainPageProps) => {
  const { className } = props;

  return (
    <main>
      <Input
        size={INPUT_SIZE.XL}
        view={INPUT_VIEW.PIMARY}
        state={INPUT_STATE.DISABLED}
        disabled
      />
      {/* <Button>Button text</Button> */}
      {/* <Button variant="secondary">Button text</Button> */}
      {/* <Button variant="outline">Button</Button> */}
      <ResourceList />
    </main>
  );
};

// export default PageMain;
