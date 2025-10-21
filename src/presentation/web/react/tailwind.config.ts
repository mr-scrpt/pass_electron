// src/presentation/web/react/tailwind.config.js
import { catppuccin } from "@catppuccin/tailwindcss";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    catppuccin({
      prefix: "ctp",
      defaultFlavour: "mocha",
    }),
  ],
};
