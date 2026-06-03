import { createContext, type ReactNode, useState } from "react";

export interface CookieConsentContextValue {
	consent: Record<string, boolean>;
	setConsent: (scope: string, accepted: boolean) => void;
}

export const CookieConsentContext =
	createContext<CookieConsentContextValue | null>(null);

interface CookieProviderProps {
	children: ReactNode;
}

export function CookieProvider({ children }: CookieProviderProps) {
	const [consent, setConsentState] = useState<Record<string, boolean>>({});

	const setConsent = (scope: string, accepted: boolean) => {
		setConsentState((prev) => ({
			...prev,
			[scope]: accepted,
		}));
	};

	return (
		<CookieConsentContext.Provider value={{ consent, setConsent }}>
			{children}
		</CookieConsentContext.Provider>
	);
}
