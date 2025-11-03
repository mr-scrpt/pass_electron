import React from "react";

type CatppuccinTheme = "mocha" | "latte" | "frappe" | "macchiato";

interface CatppuccinLogoProps extends React.SVGProps<SVGSVGElement> {
  theme?: CatppuccinTheme;
  size?: number;
}

/** Цветовые палитры Catppuccin */
const palettes: Record<CatppuccinTheme, Record<string, string>> = {
  mocha: {
    base: "#1e1e2e",
    surface2: "#585b70",
    yellow1: "#f9e2af",
    yellow2: "#f5e0dc",
    green1: "#a6e3a1",
    green2: "#94e2d5",
    blue1: "#89b4fa",
    blue2: "#b4befe",
  },
  latte: {
    base: "#eff1f5",
    surface2: "#bcc0cc",
    yellow1: "#df8e1d",
    yellow2: "#e5c890",
    green1: "#40a02b",
    green2: "#8ec07c",
    blue1: "#1e66f5",
    blue2: "#99c1f1",
  },
  frappe: {
    base: "#303446",
    surface2: "#626880",
    yellow1: "#e5c890",
    yellow2: "#eebebe",
    green1: "#a6d189",
    green2: "#81c8be",
    blue1: "#8caaee",
    blue2: "#babbf1",
  },
  macchiato: {
    base: "#24273a",
    surface2: "#5b6078",
    yellow1: "#eed49f",
    yellow2: "#f4dbd6",
    green1: "#a6da95",
    green2: "#8bd5ca",
    blue1: "#8aadf4",
    blue2: "#b7bdf8",
  },
};

export const CatppuccinLogo: React.FC<CatppuccinLogoProps> = ({
  theme = "mocha",
  size = 128,
  ...props
}) => {
  const p = palettes[theme];

  return (
    <svg
      viewBox="0 0 322 322"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      style={{
        fillRule: "evenodd",
        clipRule: "evenodd",
        strokeLinejoin: "round",
        strokeMiterlimit: 2,
      }}
      {...props}
    >
      <path
        d="M321.347 72.106C321.347 32.31 289.037 0 249.241 0H72.106C32.31 0 0 32.31 0 72.106v177.135c0 39.796 32.31 72.106 72.106 72.106h177.135c39.796 0 72.106-32.31 72.106-72.106V72.106Z"
        style={{ fill: p.base }}
      />
      <path
        d="M126.106 266.574c.775.965.309 2.517.017 2.43l-7.773 7.741c-1.686 1.206-3.365 1.132-5.009.135l-18.424-19.268c-.452-.649-.762-1.328-.833-2.058v-94.735c-22.821-8.67-39.057-30.754-39.057-56.6 0-33.006 26.478-59.876 59.333-60.511-18.551 13.563-30.61 35.488-30.61 60.208 0 28.109 15.593 52.604 38.593 65.301v87.841h.006c-.004.137-.006.275-.006.413 0 3.551 1.699 6.535 3.763 9.103Z"
        style={{ fill: p.surface2 }}
      />
      <clipPath id="a">
        <path d="M126.106 266.574c.775.965.309 2.517.017 2.43l-7.773 7.741c-1.686 1.206-3.365 1.132-5.009.135l-18.424-19.268c-.452-.649-.762-1.328-.833-2.058v-94.735c-22.821-8.67-39.057-30.754-39.057-56.6 0-33.006 26.478-59.876 59.333-60.511-18.551 13.563-30.61 35.488-30.61 60.208 0 28.109 15.593 52.604 38.593 65.301v87.841h.006c-.004.137-.006.275-.006.413 0 3.551 1.699 6.535 3.763 9.103Z" />
      </clipPath>
      <g clipPath="url(#a)">
        <path
          d="M126.531 277.545V43.603H55.027v233.942h71.504Z"
          fill={`url(#b-${theme})`}
        />
      </g>

      <path
        d="M167.618 266.574c.775.965.309 2.517.017 2.43l-7.773 7.741c-1.686 1.206-3.365 1.132-5.009.135l-18.424-19.268c-.452-.649-.762-1.328-.833-2.058v-94.735c-22.82-8.67-39.056-30.754-39.056-56.6 0-33.006 26.477-59.876 59.333-60.511-18.552 13.563-30.611 35.488-30.611 60.208 0 28.109 15.593 52.604 38.593 65.301v87.841h.007c-.005.137-.007.275-.007.413 0 3.551 1.699 6.535 3.763 9.103Z"
        style={{ fill: p.surface2 }}
      />
      <clipPath id="c">
        <path d="M167.618 266.574c.775.965.309 2.517.017 2.43l-7.773 7.741c-1.686 1.206-3.365 1.132-5.009.135l-18.424-19.268c-.452-.649-.762-1.328-.833-2.058v-94.735c-22.82-8.67-39.056-30.754-39.056-56.6 0-33.006 26.477-59.876 59.333-60.511-18.552 13.563-30.611 35.488-30.611 60.208 0 28.109 15.593 52.604 38.593 65.301v87.841h.007c-.005.137-.007.275-.007.413 0 3.551 1.699 6.535 3.763 9.103Z" />
      </clipPath>
      <g clipPath="url(#c)">
        <path
          d="M168.043 277.545V43.603H96.54v233.942h71.503Z"
          fill={`url(#d-${theme})`}
        />
      </g>

      <clipPath id="e">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M177.014 160.725c-22.82-8.67-39.056-30.753-39.056-56.599 0-33.404 27.119-60.523 60.523-60.523 33.403 0 60.523 27.119 60.523 60.523 0 28.22-19.357 51.956-45.506 58.642l26.358 26.862c.994 1.581.943 3.037-.059 4.377l-25.881 26.464 18.777 18.979c1.571 2.132 1.323 4.182-.256 6.171l-31.157 31.03c-1.686 1.207-3.364 1.133-5.008.135l-18.424-19.268c-.453-.648-.763-1.327-.834-2.057v-94.736Z"
        />
      </clipPath>
      <g clipPath="url(#e)">
        <path
          d="M259.004 277.545V43.603H137.958v233.942h121.046Z"
          fill={`url(#f-${theme})`}
        />
      </g>

      <defs>
        <linearGradient
          id={`b-${theme}`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
          gradientTransform="matrix(0 233.943 -71.5033 0 90.78 43.603)"
        >
          <stop offset="0" stopColor={p.yellow1} />
          <stop offset="1" stopColor={p.yellow2} />
        </linearGradient>
        <linearGradient
          id={`d-${theme}`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
          gradientTransform="matrix(0 233.943 -71.5033 0 132.291 43.603)"
        >
          <stop offset="0" stopColor={p.green1} />
          <stop offset="1" stopColor={p.green2} />
        </linearGradient>
        <linearGradient
          id={`f-${theme}`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
          gradientTransform="matrix(0 233.943 -121.046 0 198.481 43.603)"
        >
          <stop offset="0" stopColor={p.blue1} />
          <stop offset="1" stopColor={p.blue2} />
        </linearGradient>
      </defs>
    </svg>
  );
};
