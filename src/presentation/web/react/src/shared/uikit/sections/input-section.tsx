import { INPUT_SIZE, INPUT_STATE, INPUT_VIEW } from "@/shared/ui/input";
import { Input } from "@/shared/ui/input/ui/input";
import { Section } from "../ui/section";
import { VariantBlock } from "../ui/variant-block";
import { Showcase } from "../ui/showcase";

/**
 * Секция с демонстрацией всех вариаций Input
 */
export const InputSection = () => {
  return (
    <Section
      title="Input"
      description="Text input component with multiple views and states"
    >
      {/* PRIMARY View */}
      <VariantBlock
        title="PRIMARY"
        subtitle="Default input style with purple accent"
      >
        <Showcase label="Default">
          <Input
            view={INPUT_VIEW.PRIMARY}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
          />
        </Showcase>
        <Showcase label="Error">
          <Input
            view={INPUT_VIEW.PRIMARY}
            state={INPUT_STATE.ERROR}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
          />
        </Showcase>
        <Showcase label="Success">
          <Input
            view={INPUT_VIEW.PRIMARY}
            state={INPUT_STATE.SUCCESS}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
          />
        </Showcase>
        <Showcase label="Warning">
          <Input
            view={INPUT_VIEW.PRIMARY}
            state={INPUT_STATE.WARNING}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
          />
        </Showcase>
      </VariantBlock>

      {/* SECONDARY View */}
      <VariantBlock title="SECONDARY" subtitle="Filled input with green accent">
        <Showcase label="Default">
          <Input
            view={INPUT_VIEW.SECONDARY}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
          />
        </Showcase>
        <Showcase label="Error">
          <Input
            view={INPUT_VIEW.SECONDARY}
            state={INPUT_STATE.ERROR}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
          />
        </Showcase>
        <Showcase label="Success">
          <Input
            view={INPUT_VIEW.SECONDARY}
            state={INPUT_STATE.SUCCESS}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
          />
        </Showcase>
        <Showcase label="Warning">
          <Input
            view={INPUT_VIEW.SECONDARY}
            state={INPUT_STATE.WARNING}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
          />
        </Showcase>
      </VariantBlock>

      {/* OUTLINE View */}
      <VariantBlock title="OUTLINE" subtitle="Minimal outline style">
        <Showcase label="Default">
          <Input
            view={INPUT_VIEW.OUTLINE}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
          />
        </Showcase>
        <Showcase label="Error">
          <Input
            view={INPUT_VIEW.OUTLINE}
            state={INPUT_STATE.ERROR}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
          />
        </Showcase>
        <Showcase label="Success">
          <Input
            view={INPUT_VIEW.OUTLINE}
            state={INPUT_STATE.SUCCESS}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
          />
        </Showcase>
        <Showcase label="Warning">
          <Input
            view={INPUT_VIEW.OUTLINE}
            state={INPUT_STATE.WARNING}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
          />
        </Showcase>
      </VariantBlock>

      {/* DISABLED States */}
      <VariantBlock title="DISABLED" subtitle="All views with disabled state">
        <Showcase label="Primary - Default">
          <Input
            view={INPUT_VIEW.PRIMARY}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            disabled
          />
        </Showcase>
        <Showcase label="Primary - Error">
          <Input
            view={INPUT_VIEW.PRIMARY}
            state={INPUT_STATE.ERROR}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            disabled
          />
        </Showcase>
        <Showcase label="Primary - Success">
          <Input
            view={INPUT_VIEW.PRIMARY}
            state={INPUT_STATE.SUCCESS}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            disabled
          />
        </Showcase>
        <Showcase label="Primary - Warning">
          <Input
            view={INPUT_VIEW.PRIMARY}
            state={INPUT_STATE.WARNING}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            disabled
          />
        </Showcase>

        <Showcase label="Secondary - Default">
          <Input
            view={INPUT_VIEW.SECONDARY}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            disabled
          />
        </Showcase>
        <Showcase label="Secondary - Error">
          <Input
            view={INPUT_VIEW.SECONDARY}
            state={INPUT_STATE.ERROR}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            disabled
          />
        </Showcase>
        <Showcase label="Secondary - Success">
          <Input
            view={INPUT_VIEW.SECONDARY}
            state={INPUT_STATE.SUCCESS}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            disabled
          />
        </Showcase>
        <Showcase label="Secondary - Warning">
          <Input
            view={INPUT_VIEW.SECONDARY}
            state={INPUT_STATE.WARNING}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            disabled
          />
        </Showcase>

        <Showcase label="Outline - Default">
          <Input
            view={INPUT_VIEW.OUTLINE}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            disabled
          />
        </Showcase>
        <Showcase label="Outline - Error">
          <Input
            view={INPUT_VIEW.OUTLINE}
            state={INPUT_STATE.ERROR}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            disabled
          />
        </Showcase>
        <Showcase label="Outline - Success">
          <Input
            view={INPUT_VIEW.OUTLINE}
            state={INPUT_STATE.SUCCESS}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            disabled
          />
        </Showcase>
        <Showcase label="Outline - Warning">
          <Input
            view={INPUT_VIEW.OUTLINE}
            state={INPUT_STATE.WARNING}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            disabled
          />
        </Showcase>
      </VariantBlock>

      {/* READONLY States */}
      <VariantBlock
        title="READ-ONLY"
        subtitle="All views with read-only state (text selectable, 70% opacity)"
      >
        <Showcase label="Primary - Default">
          <Input
            view={INPUT_VIEW.PRIMARY}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            readOnly
          />
        </Showcase>
        <Showcase label="Primary - Error">
          <Input
            view={INPUT_VIEW.PRIMARY}
            state={INPUT_STATE.ERROR}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            readOnly
          />
        </Showcase>
        <Showcase label="Primary - Success">
          <Input
            view={INPUT_VIEW.PRIMARY}
            state={INPUT_STATE.SUCCESS}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            readOnly
          />
        </Showcase>
        <Showcase label="Primary - Warning">
          <Input
            view={INPUT_VIEW.PRIMARY}
            state={INPUT_STATE.WARNING}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            readOnly
          />
        </Showcase>

        <Showcase label="Secondary - Default">
          <Input
            view={INPUT_VIEW.SECONDARY}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            readOnly
          />
        </Showcase>
        <Showcase label="Secondary - Error">
          <Input
            view={INPUT_VIEW.SECONDARY}
            state={INPUT_STATE.ERROR}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            readOnly
          />
        </Showcase>
        <Showcase label="Secondary - Success">
          <Input
            view={INPUT_VIEW.SECONDARY}
            state={INPUT_STATE.SUCCESS}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            readOnly
          />
        </Showcase>
        <Showcase label="Secondary - Warning">
          <Input
            view={INPUT_VIEW.SECONDARY}
            state={INPUT_STATE.WARNING}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            readOnly
          />
        </Showcase>

        <Showcase label="Outline - Default">
          <Input
            view={INPUT_VIEW.OUTLINE}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            readOnly
          />
        </Showcase>
        <Showcase label="Outline - Error">
          <Input
            view={INPUT_VIEW.OUTLINE}
            state={INPUT_STATE.ERROR}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            readOnly
          />
        </Showcase>
        <Showcase label="Outline - Success">
          <Input
            view={INPUT_VIEW.OUTLINE}
            state={INPUT_STATE.SUCCESS}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            readOnly
          />
        </Showcase>
        <Showcase label="Outline - Warning">
          <Input
            view={INPUT_VIEW.OUTLINE}
            state={INPUT_STATE.WARNING}
            size={INPUT_SIZE.XL}
            defaultValue="Default Text"
            readOnly
          />
        </Showcase>
      </VariantBlock>
    </Section>
  );
};
