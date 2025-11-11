import { cn } from "@/shared/lib/shadcn";
import type { ComponentProps, ReactNode } from "react";

type VariantBlockProps = ComponentProps<"div"> & {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/**
 * Блок с вариацией компонента (PRIMARY, SECONDARY, OUTLINE, etc.)
 */
export const VariantBlock = (props: VariantBlockProps) => {
  const { title, subtitle, children, className, ...rest } = props;

  return (
    <div className={cn("space-y-3", className)} {...rest}>
      {/* Заголовок блока */}
      <div className="space-y-1">
        <h3 className="text-lg font-medium tracking-tight text-foreground">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Контейнер для примеров */}
      <div className="space-y-2 rounded-md border border-border bg-muted/20 p-4">
        {children}
      </div>
    </div>
  );
};
