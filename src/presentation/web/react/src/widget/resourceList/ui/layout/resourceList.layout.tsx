import type { ComponentProps, ReactNode } from "react";

type ResourceListLayoutProps = Omit<ComponentProps<"section">, "content"> & {
  content: ReactNode;
  action: ReactNode;
};

export const ResourceListLayout = (props: ResourceListLayoutProps) => {
  const { content, action } = props;
  return (
    <div className="grid">
      <div>{action}</div>
      <div>{content}</div>
    </div>
  );
};
