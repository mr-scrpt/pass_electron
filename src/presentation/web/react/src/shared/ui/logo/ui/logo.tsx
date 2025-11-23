import type { ComponentProps } from "react";
import { LOGO_SIZE, type LogoSizeType } from "../domain/size.type";
import { LOGO_VIEW, type LogoViewType } from "../domain/view.type";
import { LOGO_VARIANT, type LogoVariantType } from "../domain/variant.type";
import { logoVariantSVG } from "../data/variant-svg.map";
import { useLogoContainerClassBuilder } from "../model/useLogoContainerClassBuilder.model";
import { useLogoIconClassBuilder } from "../model/useLogoIconClassBuilder.model";
import { useLogoTextClassBuilder } from "../model/useLogoTextClassBuilder.model";

type LogoProps = Omit<ComponentProps<"div">, "size"> & {
  size?: LogoSizeType;
  view?: LogoViewType;
  variant?: LogoVariantType;
  withText?: boolean;
  animate?: boolean;
};

export const Logo = (props: LogoProps) => {
  const {
    size = LOGO_SIZE.L,
    view = LOGO_VIEW.PRIMARY,
    variant = LOGO_VARIANT.LOCK,
    withText = false,
    animate = true,
    className,
    ...rest
  } = props;

  const SVGComponent = logoVariantSVG[variant];

  const containerClass = useLogoContainerClassBuilder({ className, animate });
  const iconClass = useLogoIconClassBuilder({ size, view });
  const textClass = useLogoTextClassBuilder({ view, animate });

  return (
    <div className={containerClass} {...rest}>
      <div className={iconClass}>
        <SVGComponent view={view} animate={animate} />
      </div>
      {withText && <span className={textClass}>Password Manager</span>}
    </div>
  );
};
