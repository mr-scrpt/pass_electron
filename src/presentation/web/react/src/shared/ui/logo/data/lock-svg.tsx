import React from "react";
import type { LogoViewType } from "../domain/view.type";

interface LockSVGProps {
  view: LogoViewType;
  animate?: boolean;
}

export const LockSVG: React.FC<LockSVGProps> = ({ view, animate = false }) => {
  const isPrimary = view === "PRIMARY";

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="lockGradientPrimary"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" style={{ stopColor: "#b4befe", stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: "#cba6f7", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#f5c2e7", stopOpacity: 1 }}
          />
        </linearGradient>

        <linearGradient
          id="lockGradientSecondary"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" style={{ stopColor: "#a6e3a1", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#94e2d5", stopOpacity: 1 }}
          />
        </linearGradient>

        <linearGradient
          id="glowGradientPrimary"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            style={{ stopColor: "#cba6f7", stopOpacity: 0.3 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "#f5c2e7", stopOpacity: 0.3 }}
          />
        </linearGradient>

        <linearGradient
          id="glowGradientSecondary"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            style={{ stopColor: "#a6e3a1", stopOpacity: 0.3 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "#94e2d5", stopOpacity: 0.3 }}
          />
        </linearGradient>
      </defs>

      {/* Glow effect background */}
      <circle
        cx="24"
        cy="24"
        r="20"
        fill={
          isPrimary
            ? "url(#glowGradientPrimary)"
            : "url(#glowGradientSecondary)"
        }
        opacity="0.4"
        className={
          animate
            ? "transition-opacity duration-300 group-hover:opacity-60"
            : ""
        }
      />

      {/* Lock body */}
      <rect
        x="14"
        y="22"
        width="20"
        height="16"
        rx="2"
        fill={
          isPrimary
            ? "url(#lockGradientPrimary)"
            : "url(#lockGradientSecondary)"
        }
        className={
          animate
            ? "transition-all duration-300 group-hover:scale-105 origin-center"
            : ""
        }
      />

      {/* Lock shackle */}
      <path
        d="M18 22V16C18 12.6863 20.6863 10 24 10C27.3137 10 30 12.6863 30 16V22"
        stroke={
          isPrimary
            ? "url(#lockGradientPrimary)"
            : "url(#lockGradientSecondary)"
        }
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className={
          animate
            ? "transition-all duration-300 group-hover:stroke-width-4"
            : ""
        }
      />

      {/* Keyhole */}
      <circle cx="24" cy="28" r="2.5" fill="#1e1e2e" />
      <rect x="22.5" y="28" width="3" height="5" rx="1" fill="#1e1e2e" />

      {/* Highlight shine effect */}
      <path
        d="M20 24C20 24 22 25 24 25C26 25 28 24 28 24"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
};
