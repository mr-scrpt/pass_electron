import { LOGO_VIEW, type LogoViewType } from "../domain/view.type";

// Map of view to text color class
export const logoTextColorCln = {
    [LOGO_VIEW.PRIMARY]: "text-ctp-mauve",
    [LOGO_VIEW.SECONDARY]: "text-ctp-green",
} satisfies Record<LogoViewType, string>;
