/**
 * Accent color definition
 */
export type AccentColor = {
  name: string;
  label: string;
  className: string;
  hex: string;
};

/**
 * Base/Surface color definition
 */
export type BaseColor = {
  name: string;
  label: string;
  className: string;
  description?: string;
};

/**
 * All 14 Catppuccin Mocha accent colors
 */
export const ACCENT_COLORS: AccentColor[] = [
  {
    name: "rosewater",
    label: "Rosewater",
    className: "ctp-rosewater",
    hex: "#f5e0dc",
  },
  {
    name: "flamingo",
    label: "Flamingo",
    className: "ctp-flamingo",
    hex: "#f2cdcd",
  },
  { name: "pink", label: "Pink", className: "ctp-pink", hex: "#f5c2e7" },
  { name: "mauve", label: "Mauve", className: "ctp-mauve", hex: "#cba6f7" },
  { name: "red", label: "Red", className: "ctp-red", hex: "#f38ba8" },
  {
    name: "maroon",
    label: "Maroon",
    className: "ctp-maroon",
    hex: "#eba0ac",
  },
  { name: "peach", label: "Peach", className: "ctp-peach", hex: "#fab387" },
  {
    name: "yellow",
    label: "Yellow",
    className: "ctp-yellow",
    hex: "#f9e2af",
  },
  { name: "green", label: "Green", className: "ctp-green", hex: "#a6e3a1" },
  { name: "teal", label: "Teal", className: "ctp-teal", hex: "#94e2d5" },
  { name: "sky", label: "Sky", className: "ctp-sky", hex: "#89dceb" },
  {
    name: "sapphire",
    label: "Sapphire",
    className: "ctp-sapphire",
    hex: "#74c7ec",
  },
  { name: "blue", label: "Blue", className: "ctp-blue", hex: "#89b4fa" },
  {
    name: "lavender",
    label: "Lavender",
    className: "ctp-lavender",
    hex: "#b4befe",
  },
];

/**
 * Base colors (backgrounds)
 */
export const BASE_COLORS: BaseColor[] = [
  {
    name: "base",
    label: "Base",
    className: "ctp-base",
    description: "Main background",
  },
  {
    name: "mantle",
    label: "Mantle",
    className: "ctp-mantle",
    description: "Card background",
  },
  {
    name: "crust",
    label: "Crust",
    className: "ctp-crust",
    description: "Darkest background",
  },
];

/**
 * Surface colors (layers)
 */
export const SURFACE_COLORS: BaseColor[] = [
  { name: "surface0", label: "Surface 0", className: "ctp-surface0" },
  { name: "surface1", label: "Surface 1", className: "ctp-surface1" },
  { name: "surface2", label: "Surface 2", className: "ctp-surface2" },
];

/**
 * Text colors (hierarchy)
 */
export const TEXT_COLORS: BaseColor[] = [
  {
    name: "text",
    label: "Text",
    className: "ctp-text",
    description: "Primary text",
  },
  {
    name: "subtext0",
    label: "Subtext 0",
    className: "ctp-subtext0",
    description: "Secondary text",
  },
  {
    name: "subtext1",
    label: "Subtext 1",
    className: "ctp-subtext1",
    description: "Tertiary text",
  },
];

/**
 * Overlay colors (semi-transparent layers)
 */
export const OVERLAY_COLORS: BaseColor[] = [
  { name: "overlay0", label: "Overlay 0", className: "ctp-overlay0" },
  { name: "overlay1", label: "Overlay 1", className: "ctp-overlay1" },
  { name: "overlay2", label: "Overlay 2", className: "ctp-overlay2" },
];
