import type { ComponentProps } from "react";
import { InputSection } from "@/shared/uikit";
import { cn } from "@/shared/lib/utils";

type UIKitPageProps = ComponentProps<"main">;

/**
 * UI Kit страница - демонстрация всех компонентов дизайн-системы
 */
export const PageUIKit = (props: UIKitPageProps) => {
  const { className, ...rest } = props;

  return (
    <main
      className={cn("container mx-auto space-y-12 p-8", className)}
      {...rest}
    >
      {/* Заголовок страницы */}
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          UI Kit
        </h1>
        <p className="text-lg text-muted-foreground">
          Complete design system components showcase
        </p>
      </header>

      {/* Секции с компонентами */}
      <div className="space-y-12">
        <InputSection />
        {/* Будущие секции:
        <ButtonSection />
        <SelectSection />
        <CheckboxSection />
        */}
      </div>
    </main>
  );
};
