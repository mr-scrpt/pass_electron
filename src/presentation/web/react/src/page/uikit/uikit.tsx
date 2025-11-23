import type { ComponentProps } from "react";
import { InputSection, ColorsSection, ButtonSection, LogoSection } from "@/shared/uikit";
import { cn } from "@/shared/lib/shadcn";

type UIKitPageProps = ComponentProps<"main">;

/**
 * UI Kit страница - демонстрация всех компонентов дизайн-системы
 */
export const PageUIKit = (props: UIKitPageProps) => {
  const { className, ...rest } = props;

  return (
    <main
      className={cn(
        "mx-auto w-full max-w-[1400px] space-y-12 px-8 py-12",
        className,
      )}
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
        <ColorsSection />
        <LogoSection />
        <InputSection />
        <ButtonSection />
        {/* Будущие секции:
        <SelectSection />
        <CheckboxSection />
        */}
      </div>
    </main>
  );
};
