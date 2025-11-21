import { Section } from "../ui/section";
import { VariantBlock } from "../ui/variant-block";
import { Showcase } from "../ui/showcase";
import {
  ACCENT_COLORS,
  BASE_COLORS,
  SURFACE_COLORS,
  TEXT_COLORS,
  OVERLAY_COLORS,
} from "./colors-section.data";

/**
 * Секция с демонстрацией цветовой палитры Catppuccin Mocha
 */
export const ColorsSection = () => {
  return (
    <Section
      title="Colors"
      description="Catppuccin Mocha color palette with all available variants"
    >
      {/* ACCENT COLORS */}
      <VariantBlock
        title="Accent Colors"
        subtitle="14 vibrant accent colors for UI elements"
      >
        {ACCENT_COLORS.map((color) => {
          const bgClass = `bg-${color.className}`;
          const textClass = `text-${color.className}`;
          const borderClass = `border-${color.className}`;
          const cssVar = `var(--catppuccin-color-${color.name})`;

          return (
            <Showcase key={color.name} label={color.label}>
              <div className="flex items-center gap-4">
                {/* Цветной квадрат */}
                <div
                  className="h-16 w-16 shrink-0 rounded-lg shadow-md"
                  style={{ backgroundColor: cssVar }}
                />

                {/* Информация */}
                <div className="flex-1 space-y-1">
                  <p className="text-sm" style={{ color: cssVar }}>
                    Sample text in {color.label.toLowerCase()} color
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <code>{bgClass}</code>
                    <code>{textClass}</code>
                    <code>{borderClass}</code>
                  </div>
                  <code className="text-xs text-muted-foreground">
                    {color.hex}
                  </code>
                </div>
              </div>
            </Showcase>
          );
        })}
      </VariantBlock>

      {/* BASE & SURFACE */}
      <VariantBlock
        title="Base & Surface Colors"
        subtitle="Background layers and surfaces"
      >
        <Showcase label="Base Colors">
          <div className="space-y-3">
            {BASE_COLORS.map((color) => {
              const bgClass = `bg-${color.className}`;
              const cssVar = `var(--catppuccin-color-${color.name})`;
              return (
                <div key={color.name} className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 shrink-0 rounded-lg shadow-md"
                    style={{ backgroundColor: cssVar }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{color.label}</p>
                    {color.description && (
                      <p className="text-xs text-muted-foreground">
                        {color.description}
                      </p>
                    )}
                    <code className="text-xs text-muted-foreground">
                      {bgClass}
                    </code>
                  </div>
                </div>
              );
            })}
          </div>
        </Showcase>

        <Showcase label="Surface Colors">
          <div className="space-y-3">
            {SURFACE_COLORS.map((color) => {
              const bgClass = `bg-${color.className}`;
              const cssVar = `var(--catppuccin-color-${color.name})`;
              return (
                <div key={color.name} className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 shrink-0 rounded-lg shadow-md"
                    style={{ backgroundColor: cssVar }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{color.label}</p>
                    <code className="text-xs text-muted-foreground">
                      {bgClass}
                    </code>
                  </div>
                </div>
              );
            })}
          </div>
        </Showcase>
      </VariantBlock>

      {/* TEXT & OVERLAYS */}
      <VariantBlock
        title="Text & Overlay Colors"
        subtitle="Text hierarchy and overlay shades"
      >
        <Showcase label="Text Hierarchy">
          <div className="space-y-2">
            {TEXT_COLORS.map((color) => {
              const textClass = `text-${color.className}`;
              const cssVar = `var(--catppuccin-color-${color.name})`;
              return (
                <div key={color.name} className="space-y-0.5">
                  <p style={{ color: cssVar }}>
                    {color.label} - {color.description}
                  </p>
                  <code className="text-xs text-muted-foreground">
                    {textClass}
                  </code>
                </div>
              );
            })}
          </div>
        </Showcase>

        <Showcase label="Overlay Colors">
          <div className="space-y-3">
            {OVERLAY_COLORS.map((color) => {
              const bgClass = `bg-${color.className}`;
              const cssVar = `var(--catppuccin-color-${color.name})`;
              return (
                <div key={color.name} className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 shrink-0 rounded-lg shadow-md"
                    style={{ backgroundColor: cssVar }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{color.label}</p>
                    <code className="text-xs text-muted-foreground">
                      {bgClass}
                    </code>
                  </div>
                </div>
              );
            })}
          </div>
        </Showcase>
      </VariantBlock>
    </Section>
  );
};
