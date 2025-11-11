import { cn } from "@/shared/lib/shadcn";
import type { ComponentProps, ReactNode } from "react";

type SectionProps = ComponentProps<"section"> & {
  title: string;
  description?: string;
  children: ReactNode;
};

/**
 * Секция UI Kit - контейнер для группы элементов (Input, Button, etc.)
 */
export const Section = (props: SectionProps) => {
  const { title, description, children, className, ...rest } = props;

  return (
    <section
      className={cn(
        "space-y-6 rounded-lg border border-border bg-card p-6",
        className,
      )}
      {...rest}
    >
      {/* Заголовок секции */}
      <div className="space-y-2 border-b border-border pb-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Содержимое */}
      <div className="space-y-8">{children}</div>
    </section>
  );
};
