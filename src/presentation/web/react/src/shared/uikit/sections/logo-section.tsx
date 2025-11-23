import { Section } from "../ui/section";
import { VariantBlock } from "../ui/variant-block";
import { Showcase } from "../ui/showcase";
import { Logo, LOGO_SIZE, LOGO_VIEW, LOGO_VARIANT } from "@/shared/ui/logo";

/**
 * Секция с демонстрацией всех вариаций Logo
 */
export const LogoSection = () => {
    return (
        <Section
            title="Logo"
            description="Logo component with different sizes, views (color schemes), and variants (shapes)"
        >
            {/* VARIANTS - Lock & Shield */}
            <VariantBlock
                title="VARIANTS"
                subtitle="Different SVG shapes: LOCK (gradient premium) and SHIELD (minimalist outline)"
            >
                <Showcase label="Lock (Premium)">
                    <Logo
                        size={LOGO_SIZE.L}
                        view={LOGO_VIEW.PRIMARY}
                        variant={LOGO_VARIANT.LOCK}
                        animate={true}
                    />
                </Showcase>
                <Showcase label="Shield (Minimalist)">
                    <Logo
                        size={LOGO_SIZE.L}
                        view={LOGO_VIEW.PRIMARY}
                        variant={LOGO_VARIANT.SHIELD}
                        animate={true}
                    />
                </Showcase>
            </VariantBlock>

            {/* VIEW - Primary & Secondary */}
            <VariantBlock
                title="VIEWS"
                subtitle="Color schemes: PRIMARY (lavender/mauve/pink) and SECONDARY (green/teal)"
            >
                <Showcase label="Primary (Mauve/Pink)">
                    <Logo
                        size={LOGO_SIZE.L}
                        view={LOGO_VIEW.PRIMARY}
                        variant={LOGO_VARIANT.LOCK}
                    />
                </Showcase>
                <Showcase label="Secondary (Green/Teal)">
                    <Logo
                        size={LOGO_SIZE.L}
                        view={LOGO_VIEW.SECONDARY}
                        variant={LOGO_VARIANT.LOCK}
                    />
                </Showcase>
            </VariantBlock>

            {/* SIZES */}
            <VariantBlock title="SIZES" subtitle="All available logo sizes">
                <Showcase label="Small (S) - 24px">
                    <Logo
                        size={LOGO_SIZE.S}
                        view={LOGO_VIEW.PRIMARY}
                        variant={LOGO_VARIANT.LOCK}
                    />
                </Showcase>
                <Showcase label="Medium (M) - 32px">
                    <Logo
                        size={LOGO_SIZE.M}
                        view={LOGO_VIEW.PRIMARY}
                        variant={LOGO_VARIANT.LOCK}
                    />
                </Showcase>
                <Showcase label="Large (L) - 48px">
                    <Logo
                        size={LOGO_SIZE.L}
                        view={LOGO_VIEW.PRIMARY}
                        variant={LOGO_VARIANT.LOCK}
                    />
                </Showcase>
                <Showcase label="Extra Large (XL) - 64px">
                    <Logo
                        size={LOGO_SIZE.XL}
                        view={LOGO_VIEW.PRIMARY}
                        variant={LOGO_VARIANT.LOCK}
                    />
                </Showcase>
            </VariantBlock>

            {/* WITH TEXT */}
            <VariantBlock
                title="WITH TEXT"
                subtitle="Logo with 'Password Manager' text label"
            >
                <Showcase label="Lock + Text (Primary)">
                    <Logo
                        size={LOGO_SIZE.L}
                        view={LOGO_VIEW.PRIMARY}
                        variant={LOGO_VARIANT.LOCK}
                        withText={true}
                    />
                </Showcase>
                <Showcase label="Lock + Text (Secondary)">
                    <Logo
                        size={LOGO_SIZE.L}
                        view={LOGO_VIEW.SECONDARY}
                        variant={LOGO_VARIANT.LOCK}
                        withText={true}
                    />
                </Showcase>
                <Showcase label="Shield + Text (Primary)">
                    <Logo
                        size={LOGO_SIZE.L}
                        view={LOGO_VIEW.PRIMARY}
                        variant={LOGO_VARIANT.SHIELD}
                        withText={true}
                    />
                </Showcase>
                <Showcase label="Shield + Text (Secondary)">
                    <Logo
                        size={LOGO_SIZE.L}
                        view={LOGO_VIEW.SECONDARY}
                        variant={LOGO_VARIANT.SHIELD}
                        withText={true}
                    />
                </Showcase>
            </VariantBlock>

            {/* ALL COMBINATIONS */}
            <VariantBlock
                title="ALL COMBINATIONS"
                subtitle="Complete matrix of variant × view combinations"
            >
                <Showcase label="Lock + Primary">
                    <Logo
                        size={LOGO_SIZE.XL}
                        view={LOGO_VIEW.PRIMARY}
                        variant={LOGO_VARIANT.LOCK}
                        withText={true}
                        animate={true}
                    />
                </Showcase>
                <Showcase label="Lock + Secondary">
                    <Logo
                        size={LOGO_SIZE.XL}
                        view={LOGO_VIEW.SECONDARY}
                        variant={LOGO_VARIANT.LOCK}
                        withText={true}
                        animate={true}
                    />
                </Showcase>
                <Showcase label="Shield + Primary">
                    <Logo
                        size={LOGO_SIZE.XL}
                        view={LOGO_VIEW.PRIMARY}
                        variant={LOGO_VARIANT.SHIELD}
                        withText={true}
                        animate={true}
                    />
                </Showcase>
                <Showcase label="Shield + Secondary">
                    <Logo
                        size={LOGO_SIZE.XL}
                        view={LOGO_VIEW.SECONDARY}
                        variant={LOGO_VARIANT.SHIELD}
                        withText={true}
                        animate={true}
                    />
                </Showcase>
            </VariantBlock>

            {/* ANIMATION */}
            <VariantBlock
                title="ANIMATION"
                subtitle="Hover effects (hover over logos to see animations)"
            >
                <Showcase label="Animated Lock">
                    <Logo
                        size={LOGO_SIZE.L}
                        view={LOGO_VIEW.PRIMARY}
                        variant={LOGO_VARIANT.LOCK}
                        animate={true}
                    />
                </Showcase>
                <Showcase label="Animated Shield">
                    <Logo
                        size={LOGO_SIZE.L}
                        view={LOGO_VIEW.PRIMARY}
                        variant={LOGO_VARIANT.SHIELD}
                        animate={true}
                    />
                </Showcase>
                <Showcase label="Static (No Animation)">
                    <Logo
                        size={LOGO_SIZE.L}
                        view={LOGO_VIEW.PRIMARY}
                        variant={LOGO_VARIANT.LOCK}
                        animate={false}
                    />
                </Showcase>
            </VariantBlock>
        </Section>
    );
};
