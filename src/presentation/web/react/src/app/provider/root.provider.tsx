"use client";
import type { ComponentProps } from "react";
import { QueryProvider } from "./query.provider";
import { ComposeChildren } from "@/shared/lib/react.component";
import { NotificationProvider } from "./notification.provider";
type RootProviderProps = ComponentProps<"div">;
export const RootProvider = (props: RootProviderProps) => {
  const { children } = props;
  return (
    <ComposeChildren>
      <NotificationProvider />

      <QueryProvider />
      <>{children}</>
    </ComposeChildren>
  );
};
