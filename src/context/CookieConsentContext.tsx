import { createContext, type ReactNode, useMemo, useState } from "react";

export interface CookieConsentContextValue {
	consent: Record<string, boolean>;
	scopes: Required<CookieScope>[];
	setConsent: (scope: string, accepted: boolean) => void;
	isBannerOpen: boolean;
	setBannerOpen: (open: boolean) => void;
	acceptAll: () => void;
	rejectAll: () => void;
}

const DEFAULT_PATH = "/";
const DEFAULT_MAX_AGE = 2592000; // 1 month

export interface CookieScope {
	scope: string;
	path?: string;
	maxAge?: number;
}

export const CookieConsentContext =
	createContext<CookieConsentContextValue | null>(null);

interface CookieProviderProps {
	scopes: CookieScope[];
	children: ReactNode;
}

export function CookieProvider({ scopes, children }: CookieProviderProps) {
	const normalizedScopes = useMemo(() => {
		const normalized = scopes.map((s) => ({
			...s,
			path: s.path ?? DEFAULT_PATH,
			maxAge: s.maxAge ?? DEFAULT_MAX_AGE,
		}));
		if (scopes.some((s) => s.scope === "essential")) return normalized;
		return [
			{ scope: "essential", path: DEFAULT_PATH, maxAge: DEFAULT_MAX_AGE },
			...normalized,
		];
	}, [scopes]);
	const [consent, setConsentState] = useState<Record<string, boolean>>({});
	const [isBannerOpen, setBannerOpen] = useState(true);

	const setConsent = (scope: string, accepted: boolean) => {
		setConsentState((prev) => ({
			...prev,
			[scope]: accepted,
		}));
	};

	const acceptAll = () => {
		setConsentState(
			Object.fromEntries(normalizedScopes.map((s) => [s.scope, true])),
		);
		setBannerOpen(false);
	};

	const rejectAll = () => {
		setConsentState(
			Object.fromEntries(normalizedScopes.map((s) => [s.scope, false])),
		);
		setBannerOpen(false);
	};

	return (
		<CookieConsentContext.Provider
			value={{
				consent,
				scopes: normalizedScopes,
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
