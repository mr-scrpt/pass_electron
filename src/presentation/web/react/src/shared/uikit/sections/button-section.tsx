import { Section } from "../ui/section";
import { VariantBlock } from "../ui/variant-block";
import { Showcase } from "../ui/showcase";
import { BUTTON_SIZE } from "@/shared/ui/button/domain/size.type";
import { BUTTON_STATE } from "@/shared/ui/button/domain/state.type";
import { BUTTON_VIEW } from "@/shared/ui/button/domain/view.type";
import { Button } from "@/shared/ui/button";

/**
 * Секция с демонстрацией всех вариаций Button
 */
export const ButtonSection = () => {
  return (
    <Section
      title="Button"
      description="Button component with multiple views, states and sizes"
    >
      {/* PRIMARY View */}
      <VariantBlock
        title="PRIMARY"
        subtitle="Filled button with primary accent color"
      >
        <Showcase label="Idle">
          <Button view={BUTTON_VIEW.PRIMARY} size={BUTTON_SIZE.XL}>
            Primary Button
          </Button>
        </Showcase>
        <Showcase label="Error">
          <Button
            view={BUTTON_VIEW.PRIMARY}
            state={BUTTON_STATE.ERROR}
            size={BUTTON_SIZE.XL}
          >
            Error Button
          </Button>
        </Showcase>
        <Showcase label="Success">
          <Button
            view={BUTTON_VIEW.PRIMARY}
            state={BUTTON_STATE.SUCCESS}
            size={BUTTON_SIZE.XL}
          >
            Success Button
          </Button>
        </Showcase>
        <Showcase label="Warning">
          <Button
            view={BUTTON_VIEW.PRIMARY}
            state={BUTTON_STATE.WARNING}
            size={BUTTON_SIZE.XL}
          >
            Warning Button
          </Button>
        </Showcase>
      </VariantBlock>

      {/* SECONDARY View */}
      <VariantBlock
        title="SECONDARY"
        subtitle="Filled button with secondary accent color"
      >
        <Showcase label="Idle">
          <Button view={BUTTON_VIEW.SECONDARY} size={BUTTON_SIZE.XL}>
            Secondary Button
          </Button>
        </Showcase>
        <Showcase label="Error">
          <Button
            view={BUTTON_VIEW.SECONDARY}
            state={BUTTON_STATE.ERROR}
            size={BUTTON_SIZE.XL}
          >
            Error Button
          </Button>
        </Showcase>
        <Showcase label="Success">
          <Button
            view={BUTTON_VIEW.SECONDARY}
            state={BUTTON_STATE.SUCCESS}
            size={BUTTON_SIZE.XL}
          >
            Success Button
          </Button>
        </Showcase>
        <Showcase label="Warning">
          <Button
            view={BUTTON_VIEW.SECONDARY}
            state={BUTTON_STATE.WARNING}
            size={BUTTON_SIZE.XL}
          >
            Warning Button
          </Button>
        </Showcase>
      </VariantBlock>

      {/* OUTLINE View */}
      <VariantBlock title="OUTLINE" subtitle="Minimal outline button style">
        <Showcase label="Idle">
          <Button view={BUTTON_VIEW.OUTLINE} size={BUTTON_SIZE.XL}>
            Outline Button
          </Button>
        </Showcase>
        <Showcase label="Error">
          <Button
            view={BUTTON_VIEW.OUTLINE}
            state={BUTTON_STATE.ERROR}
            size={BUTTON_SIZE.XL}
          >
            Error Button
          </Button>
        </Showcase>
        <Showcase label="Success">
          <Button
            view={BUTTON_VIEW.OUTLINE}
            state={BUTTON_STATE.SUCCESS}
            size={BUTTON_SIZE.XL}
          >
            Success Button
          </Button>
        </Showcase>
        <Showcase label="Warning">
          <Button
            view={BUTTON_VIEW.OUTLINE}
            state={BUTTON_STATE.WARNING}
            size={BUTTON_SIZE.XL}
          >
            Warning Button
          </Button>
        </Showcase>
      </VariantBlock>

      {/* SIZES */}
      <VariantBlock title="SIZES" subtitle="All available button sizes">
        <Showcase label="Small (S)">
          <Button view={BUTTON_VIEW.PRIMARY} size={BUTTON_SIZE.S}>
            Small Button
          </Button>
        </Showcase>
        <Showcase label="Medium (M)">
          <Button view={BUTTON_VIEW.PRIMARY} size={BUTTON_SIZE.M}>
            Medium Button
          </Button>
        </Showcase>
        <Showcase label="Large (L)">
          <Button view={BUTTON_VIEW.PRIMARY} size={BUTTON_SIZE.L}>
            Large Button
          </Button>
        </Showcase>
        <Showcase label="Extra Large (XL)">
          <Button view={BUTTON_VIEW.PRIMARY} size={BUTTON_SIZE.XL}>
            Extra Large Button
          </Button>
        </Showcase>
      </VariantBlock>

      {/* DISABLED States */}
      <VariantBlock title="DISABLED" subtitle="All views with disabled state">
        <Showcase label="Primary - Idle">
          <Button view={BUTTON_VIEW.PRIMARY} size={BUTTON_SIZE.XL} disabled>
            Disabled Button
          </Button>
        </Showcase>
        <Showcase label="Primary - Error">
          <Button
            view={BUTTON_VIEW.PRIMARY}
            state={BUTTON_STATE.ERROR}
            size={BUTTON_SIZE.XL}
            disabled
          >
            Disabled Error
          </Button>
        </Showcase>
        <Showcase label="Primary - Success">
          <Button
            view={BUTTON_VIEW.PRIMARY}
            state={BUTTON_STATE.SUCCESS}
            size={BUTTON_SIZE.XL}
            disabled
          >
            Disabled Success
          </Button>
        </Showcase>
        <Showcase label="Primary - Warning">
          <Button
            view={BUTTON_VIEW.PRIMARY}
            state={BUTTON_STATE.WARNING}
            size={BUTTON_SIZE.XL}
            disabled
          >
            Disabled Warning
          </Button>
        </Showcase>

        <Showcase label="Secondary - Idle">
          <Button view={BUTTON_VIEW.SECONDARY} size={BUTTON_SIZE.XL} disabled>
            Disabled Button
          </Button>
        </Showcase>
        <Showcase label="Secondary - Error">
          <Button
            view={BUTTON_VIEW.SECONDARY}
            state={BUTTON_STATE.ERROR}
            size={BUTTON_SIZE.XL}
            disabled
          >
            Disabled Error
          </Button>
        </Showcase>
        <Showcase label="Secondary - Success">
          <Button
            view={BUTTON_VIEW.SECONDARY}
            state={BUTTON_STATE.SUCCESS}
            size={BUTTON_SIZE.XL}
            disabled
          >
            Disabled Success
          </Button>
        </Showcase>
        <Showcase label="Secondary - Warning">
          <Button
            view={BUTTON_VIEW.SECONDARY}
            state={BUTTON_STATE.WARNING}
            size={BUTTON_SIZE.XL}
            disabled
          >
            Disabled Warning
          </Button>
        </Showcase>

        <Showcase label="Outline - Idle">
          <Button view={BUTTON_VIEW.OUTLINE} size={BUTTON_SIZE.XL} disabled>
            Disabled Button
          </Button>
        </Showcase>
        <Showcase label="Outline - Error">
          <Button
            view={BUTTON_VIEW.OUTLINE}
            state={BUTTON_STATE.ERROR}
            size={BUTTON_SIZE.XL}
            disabled
          >
            Disabled Error
          </Button>
        </Showcase>
        <Showcase label="Outline - Success">
          <Button
            view={BUTTON_VIEW.OUTLINE}
            state={BUTTON_STATE.SUCCESS}
            size={BUTTON_SIZE.XL}
            disabled
          >
            Disabled Success
          </Button>
        </Showcase>
        <Showcase label="Outline - Warning">
          <Button
            view={BUTTON_VIEW.OUTLINE}
            state={BUTTON_STATE.WARNING}
            size={BUTTON_SIZE.XL}
            disabled
          >
            Disabled Warning
          </Button>
        </Showcase>
      </VariantBlock>
    </Section>
  );
};
