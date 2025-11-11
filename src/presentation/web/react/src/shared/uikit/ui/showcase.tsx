import { cn } from "@/shared/lib/shadcn";
import type { ComponentProps, ReactNode } from "react";

type ShowcaseProps = ComponentProps<"div"> & {
  label?: string;
  children: ReactNode;
};

/**
 * Контейнер для демонстрации одного компонента с лейблом
 */
export const Showcase = (props: ShowcaseProps) => {
  const { label, children, className, ...rest } = props;

  return (
    <div className={cn("space-y-1.5", className)} {...rest}>
      {label && (
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}
      {children}
    </div>
  );
};
