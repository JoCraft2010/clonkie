import { useContext, useEffect, useState } from "react";
import { CookieConsentContext } from "../context";

export function useCookieBanner() {
	const context = useContext(CookieConsentContext);

	const [draftConsent, setDraftConsent] = useState<Record<string, boolean>>({});

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally sync only on open
	useEffect(() => {
		if (context?.isBannerOpen) {
			setDraftConsent({ ...context.consent });
		}
	}, [context?.isBannerOpen]);

	if (context === null)
		throw new Error("useCookieBanner must be used within a CookieProvider");

	const setConsent = (scope: string, accepted: boolean) => {
		setDraftConsent((prev) => ({
			...prev,
			[scope]: accepted,
		}));
	};

	const applySelection = () => {
		for (const [scope, accepted] of Object.entries(draftConsent)) {
			context.setConsent(scope, accepted);
		}
		context.setBannerOpen(false);
	};

	return {
		isOpen: context.isBannerOpen,
		setBannerOpen: context.setBannerOpen,
		consent: draftConsent,
		setConsent,
		acceptAll: context.acceptAll,
		rejectAll: context.rejectAll,
		applySelection,
	};
}
