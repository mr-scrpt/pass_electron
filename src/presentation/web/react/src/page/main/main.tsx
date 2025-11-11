import { ResourceList } from "@/features/resourceList";
import { Title } from "@/shared/ui/title";
import type { ComponentProps } from "react";

type MainPageProps = ComponentProps<"main">;

/**
 * Главная страница приложения
 */
export const PageMain = (props: MainPageProps) => {
  const { className } = props;

  return (
    <main className="container mx-auto p-8">
      <Title text="Password Manager" />
      <ResourceList />
    </main>
  );
};

// export default PageMain;
