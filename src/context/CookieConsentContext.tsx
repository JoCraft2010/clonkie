import {
	createContext,
	type ReactNode,
	useEffect,
	useMemo,
	useState,
} from "react";
import { getCookie, setCookie } from "../utils/cookie";

export interface CookieConsentContextValue {
	consent: Record<string, boolean>;
	scopes: NormalizedCookieScope[];
	setConsent: (scope: string, accepted: boolean) => void;
	isBannerOpen: boolean;
	setBannerOpen: (open: boolean) => void;
	acceptAll: () => void;
	rejectAll: () => void;
}

const CONSENT_COOKIE = "__clonkie_consent";
const DEFAULT_PATH = "/";
const DEFAULT_MAX_AGE = 2592000; // 1 month

export interface CookieScope {
	scope: string;
	path?: string;
	maxAge?: number;
	domain?: string;
	secure?: boolean;
	sameSite?: "Strict" | "Lax" | "None";
}

export interface NormalizedCookieScope {
	scope: string;
	path: string;
	maxAge: number;
	domain?: string;
	secure: boolean;
	sameSite: "Strict" | "Lax" | "None";
}

export const CookieConsentContext =
	createContext<CookieConsentContextValue | null>(null);

interface CookieProviderProps {
	scopes: CookieScope[];
	children: ReactNode;
}

export function CookieProvider({ scopes, children }: CookieProviderProps) {
	const normalizedScopes = useMemo(() => {
		const normalized: NormalizedCookieScope[] = scopes.map((s) => ({
			scope: s.scope,
			path: s.path ?? DEFAULT_PATH,
			maxAge: s.maxAge ?? DEFAULT_MAX_AGE,
			domain: s.domain,
			secure: s.secure ?? false,
			sameSite: s.sameSite ?? "Lax",
		}));
		if (scopes.some((s) => s.scope === "essential")) return normalized;
		return [
			{
				scope: "essential",
				path: DEFAULT_PATH,
				maxAge: DEFAULT_MAX_AGE,
				secure: false,
				sameSite: "Lax" as const,
			},
			...normalized,
		];
	}, [scopes]);
	const [consent, setConsentState] = useState<Record<string, boolean>>(() => {
		const raw = getCookie(CONSENT_COOKIE);
		if (raw === undefined) return {};
		try {
			return JSON.parse(raw) as Record<string, boolean>;
		} catch {
			return {};
		}
	});
	const [isBannerOpen, setBannerOpen] = useState(() => {
		const raw = getCookie(CONSENT_COOKIE);
		if (raw === undefined) return true;
		try {
			const parsed = JSON.parse(raw);
			return Object.keys(parsed).length === 0;
		} catch {
			return true;
		}
	});

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

	useEffect(() => {
		setCookie(CONSENT_COOKIE, JSON.stringify(consent), {
			path: DEFAULT_PATH,
			maxAge: DEFAULT_MAX_AGE,
			secure: true,
		});
	}, [consent]);

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
