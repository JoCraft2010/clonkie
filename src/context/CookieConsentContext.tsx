import { createContext, type ReactNode, useState } from "react";

export interface CookieConsentContextValue {
	consent: Record<string, boolean>;
	setConsent: (scope: string, accepted: boolean) => void;
	isBannerOpen: boolean;
	setBannerOpen: (open: boolean) => void;
	acceptAll: () => void;
	rejectAll: () => void;
}

export const CookieConsentContext =
	createContext<CookieConsentContextValue | null>(null);

interface CookieProviderProps {
	scopes: string[];
	children: ReactNode;
}

export function CookieProvider({ scopes, children }: CookieProviderProps) {
	const [consent, setConsentState] = useState<Record<string, boolean>>({});
	const [isBannerOpen, setBannerOpen] = useState(true);

	const setConsent = (scope: string, accepted: boolean) => {
		setConsentState((prev) => ({
			...prev,
			[scope]: accepted,
		}));
	};

	const acceptAll = () => {
		setConsentState(Object.fromEntries(scopes.map((key) => [key, true])));
		setBannerOpen(false);
	};

	const rejectAll = () => {
		setConsentState(Object.fromEntries(scopes.map((key) => [key, false])));
		setBannerOpen(false);
	};

	return (
		<CookieConsentContext.Provider
			value={{
				consent,
				setConsent,
				isBannerOpen,
				setBannerOpen,
				acceptAll,
				rejectAll,
			}}
		>
			{children}
		</CookieConsentContext.Provider>
	);
}
