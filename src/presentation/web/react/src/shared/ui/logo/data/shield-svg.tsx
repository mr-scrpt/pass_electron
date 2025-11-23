import React from "react";
import type { LogoViewType } from "../domain/view.type";

interface ShieldSVGProps {
  view: LogoViewType;
  animate?: boolean;
}

export const ShieldSVG: React.FC<ShieldSVGProps> = ({
  view,
  animate = false,
}) => {
  const strokeColor = view === "PRIMARY" ? "#cba6f7" : "#a6e3a1";

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield outline */}
      <path
        d="M24 4L8 10V20C8 29.5 14.5 38.2 24 40C33.5 38.2 40 29.5 40 20V10L24 4Z"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
        className={
          animate
            ? "transition-all duration-300 group-hover:stroke-[3] group-hover:drop-shadow-lg"
            : ""
        }
      />

      {/* Inner lock symbol */}
      <rect
        x="19"
        y="22"
        width="10"
        height="8"
        rx="1"
        stroke={strokeColor}
        strokeWidth="2"
        fill="none"
        className={
          animate
            ? "transition-all duration-300 group-hover:fill-current group-hover:fill-opacity-20"
            : ""
        }
        style={{ color: strokeColor }}
      />

      {/* Lock shackle */}
      <path
        d="M21 22V18C21 16.3431 22.3431 15 24 15C25.6569 15 27 16.3431 27 18V22"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        className={
          animate ? "transition-all duration-300 group-hover:stroke-[2.5]" : ""
        }
      />

      {/* Keyhole dot */}
      <circle
        cx="24"
        cy="26"
        r="1.5"
        fill={strokeColor}
        className={animate ? "transition-all duration-300 group-hover:r-2" : ""}
      />
    </svg>
  );
};
