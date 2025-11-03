import type { SVGProps } from "react";
import { CatppuccinLogo } from "./logoSVG";
import type { LogoSizeType } from "../domain/size.type";
import { logoSize } from "../domain/size.cln";

type LogoProps = SVGProps<SVGSVGElement> & { size: LogoSizeType };

export const Logo = (props: LogoProps) => {
  const { className, size } = props;
  const sizeSVG = logoSize[size];
  return <CatppuccinLogo className={className} size={sizeSVG} />;
};
