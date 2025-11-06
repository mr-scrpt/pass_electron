import { ResourceList } from "@/features/resourceList";
import { INPUT_SIZE, INPUT_VIEW } from "@/shared/ui/input";
import { INPUT_STATE } from "@/shared/ui/input/domain/state.type";
import { Input } from "@/shared/ui/input/ui/input";
import { Title } from "@/shared/ui/title";
// import { Button } from "@/shared/ui/shadcn/button";
import type { ComponentProps } from "react";

type MainPageProps = ComponentProps<"main">;

export const PageMain = (props: MainPageProps) => {
  const { className } = props;

  return (
    <main>
      <Title text="PRIMARY" />
      <div className="flex flex-col gap-2">
        <Input
          view={INPUT_VIEW.PRIMARY}
          size={INPUT_SIZE.XL}
          defaultValue="Default Text"
        />
        <Input
          view={INPUT_VIEW.PRIMARY}
          state={INPUT_STATE.ERROR}
          size={INPUT_SIZE.XL}
          defaultValue="Default Text"
        />
        <Input
          view={INPUT_VIEW.PRIMARY}
          state={INPUT_STATE.SUCCESS}
          size={INPUT_SIZE.XL}
          defaultValue="Default Text"
        />
        <Input
          view={INPUT_VIEW.PRIMARY}
          state={INPUT_STATE.WARNING}
          size={INPUT_SIZE.XL}
          defaultValue="Default Text"
        />
      </div>

      <Title text="PRIMARY DISABLED" />
      <div className="flex flex-col gap-2">
        <Input
          view={INPUT_VIEW.PRIMARY}
          size={INPUT_SIZE.XL}
          defaultValue="Default Text"
          disabled
        />
        <Input
          view={INPUT_VIEW.PRIMARY}
          state={INPUT_STATE.ERROR}
          size={INPUT_SIZE.XL}
          defaultValue="Default Text"
          disabled
        />
        <Input
          view={INPUT_VIEW.PRIMARY}
          state={INPUT_STATE.SUCCESS}
          size={INPUT_SIZE.XL}
          defaultValue="Default Text"
          disabled
        />
        <Input
          view={INPUT_VIEW.PRIMARY}
          state={INPUT_STATE.WARNING}
          size={INPUT_SIZE.XL}
          defaultValue="Default Text"
          disabled
        />
      </div>
      <Title text="PRIMARY READONLY" />
      <div className="flex flex-col gap-2">
        <Input
          view={INPUT_VIEW.PRIMARY}
          size={INPUT_SIZE.XL}
          readOnly
          defaultValue="Default Text"
        />
        <Input
          view={INPUT_VIEW.PRIMARY}
          state={INPUT_STATE.ERROR}
          size={INPUT_SIZE.XL}
          readOnly
          defaultValue="Default Text"
        />
        <Input
          view={INPUT_VIEW.PRIMARY}
          state={INPUT_STATE.SUCCESS}
          size={INPUT_SIZE.XL}
          defaultValue="Default Text"
          readOnly
        />
        <Input
          view={INPUT_VIEW.PRIMARY}
          state={INPUT_STATE.WARNING}
          size={INPUT_SIZE.XL}
          defaultValue="Default Text"
          readOnly
        />
      </div>

      <br />
      <Title text="Secondry" />
      <div className="flex flex-col gap-2">
        <Input
          view={INPUT_VIEW.SECONDARY}
          size={INPUT_SIZE.XL}
          defaultValue="Default Text"
        />
        <Input
          view={INPUT_VIEW.SECONDARY}
          state={INPUT_STATE.ERROR}
          size={INPUT_SIZE.XL}
          defaultValue="Default Text"
        />
        <Input
          view={INPUT_VIEW.SECONDARY}
          state={INPUT_STATE.SUCCESS}
          size={INPUT_SIZE.XL}
          defaultValue="Default Text"
        />
        <Input
          view={INPUT_VIEW.SECONDARY}
          state={INPUT_STATE.WARNING}
          size={INPUT_SIZE.XL}
          defaultValue="Default Text"
        />
      </div>
      <Title text="Secondry" />
      <div className="flex flex-col gap-2">
        <Input
          view={INPUT_VIEW.SECONDARY}
          size={INPUT_SIZE.XL}
          disabled
          defaultValue="Default Text"
        />
        <Input
          view={INPUT_VIEW.SECONDARY}
          state={INPUT_STATE.ERROR}
          size={INPUT_SIZE.XL}
          disabled
          defaultValue="Default Text"
        />
        <Input
          view={INPUT_VIEW.SECONDARY}
          state={INPUT_STATE.SUCCESS}
          size={INPUT_SIZE.XL}
          disabled
          defaultValue="Default Text"
        />
        <Input
          view={INPUT_VIEW.SECONDARY}
          state={INPUT_STATE.WARNING}
          size={INPUT_SIZE.XL}
          disabled
          defaultValue="Default Text"
        />
      </div>
      <Title text="Secondry" />
      <div className="flex flex-col gap-2">
        <Input
          view={INPUT_VIEW.SECONDARY}
          size={INPUT_SIZE.XL}
          readOnly
          defaultValue="Default Text"
        />
        <Input
          view={INPUT_VIEW.SECONDARY}
          state={INPUT_STATE.ERROR}
          size={INPUT_SIZE.XL}
          readOnly
          defaultValue="Default Text"
        />
        <Input
          view={INPUT_VIEW.SECONDARY}
          state={INPUT_STATE.SUCCESS}
          size={INPUT_SIZE.XL}
          readOnly
          defaultValue="Default Text"
        />
        <Input
          view={INPUT_VIEW.SECONDARY}
          state={INPUT_STATE.WARNING}
          size={INPUT_SIZE.XL}
          readOnly
          defaultValue="Default Text"
        />
      </div>

      {/* <Button>Button text</Button> */}
      {/* <Button variant="secondary">Button text</Button> */}
      {/* <Button variant="outline">Button</Button> */}
      <ResourceList />
    </main>
  );
};

// export default PageMain;
