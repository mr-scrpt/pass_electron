import type { ComponentProps, ReactNode } from "react";

type HeaderLayoutProps = ComponentProps<"div"> & {
  brand: ReactNode;
};

export const HeaderLayout = (props: HeaderLayoutProps) => {
  const { brand, ...rest } = props;
  return (
    <div {...rest}>
      <div>{brand}</div>
    </div>
  );
};
