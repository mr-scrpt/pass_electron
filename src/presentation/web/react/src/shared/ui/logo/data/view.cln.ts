import type { EnsureAllKeys } from "@/shared/lib/typescript";
import { LOGO_VIEW, type LogoViewType } from "../domain/view.type";

const commonViewClasses = ["transition-all", "duration-300"];

export const logoViewCln = {
  [LOGO_VIEW.PRIMARY]: [...commonViewClasses],
  [LOGO_VIEW.SECONDARY]: [...commonViewClasses],
} satisfies EnsureAllKeys<LogoViewType, string[]>;
