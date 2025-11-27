import { Section } from "../ui/section";
import { VariantBlock } from "../ui/variant-block";
import { Showcase } from "../ui/showcase";
import { Title, TITLE_SIZE, TITLE_VIEW } from "@/shared/ui/title";

/**
 * Секция с демонстрацией всех вариаций Title
 */
export const TitleSection = () => {
    return (
        <Section
            title="Title"
            description="Title component with multiple views and sizes"
        >
            {/* VIEWS */}
            <VariantBlock title="VIEWS" subtitle="Available visual styles">
                <Showcase label="Primary">
                    <Title text="Primary Title" view={TITLE_VIEW.PRIMARY} />
                </Showcase>
                <Showcase label="Secondary">
                    <Title text="Secondary Title" view={TITLE_VIEW.SECONDARY} />
                </Showcase>
            </VariantBlock>

            {/* SIZES */}
            <VariantBlock title="SIZES" subtitle="Available text sizes">
                <Showcase label="Small (S)">
                    <Title text="Small Title" size={TITLE_SIZE.S} />
                </Showcase>
                <Showcase label="Medium (M)">
                    <Title text="Medium Title" size={TITLE_SIZE.M} />
                </Showcase>
                <Showcase label="Large (L)">
                    <Title text="Large Title" size={TITLE_SIZE.L} />
                </Showcase>
                <Showcase label="Extra Large (XL)">
                    <Title text="Extra Large Title" size={TITLE_SIZE.XL} />
                </Showcase>
            </VariantBlock>
        </Section>
    );
};
