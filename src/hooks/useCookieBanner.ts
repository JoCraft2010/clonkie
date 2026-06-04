import { useContext } from "react";
import { CookieConsentContext } from "../context";

export function useCookieBanner() {
	const context = useContext(CookieConsentContext);

	if (context === null)
		return {
			isOpen: false,
			setBannerOpen: (_open: boolean) => {},
			acceptAll: () => {},
			rejectAll: () => {},
		};

	return {
		isOpen: context.isBannerOpen,
		setBannerOpen: context.setBannerOpen,
		acceptAll: context.acceptAll,
		rejectAll: context.rejectAll,
	};
}
