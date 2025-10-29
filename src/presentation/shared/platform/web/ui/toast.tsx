"use client";

import { Toaster, type ToasterProps } from "sonner";

const TOAST_SETTINGS: ToasterProps = {
  position: "top-right",
  richColors: true,
  expand: true,
  duration: 4000,
  theme: "dark",
};
export const Toast = () => {
  return <Toaster {...TOAST_SETTINGS} />;
};
