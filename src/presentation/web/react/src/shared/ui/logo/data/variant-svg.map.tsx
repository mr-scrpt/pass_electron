import type { FC } from "react";
import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { LOGO_VARIANT, type LogoVariantType } from "../domain/variant.type";
import type { LogoViewType } from "../domain/view.type";
import { LockSVG } from "./lock-svg";
import { ShieldSVG } from "./shield-svg";

interface SVGComponentProps {
    view: LogoViewType;
    animate?: boolean;
}

export const logoVariantSVG = {
    [LOGO_VARIANT.LOCK]: LockSVG,
    [LOGO_VARIANT.SHIELD]: ShieldSVG,
} satisfies EnsureAllKeys<LogoVariantType, FC<SVGComponentProps>>;
