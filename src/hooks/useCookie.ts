import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CookieConsentContext } from "../context";
import { useConsent } from "./useConsent";

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getCookie(name: string): string | undefined {
	if (typeof document === "undefined") return undefined;
	const match = document.cookie.match(
		new RegExp(`(?:^|;\\s*)${escapeRegExp(name)}=(.*?)(?:;|$)`),
	);
	return match ? decodeURIComponent(match[1]) : undefined;
}

function setCookie(
	name: string,
	value: string,
	path: string,
	maxAge: number,
): void {
	if (typeof document === "undefined") return;
	// biome-ignore lint/suspicious/noDocumentCookie: cookie library
	document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};path=${path};max-age=${maxAge};SameSite=Lax`;
}

function deleteCookie(name: string, path: string): void {
	if (typeof document === "undefined") return;
	// biome-ignore lint/suspicious/noDocumentCookie: cookie library
	document.cookie = `${encodeURIComponent(name)}=;path=${path};max-age=0;SameSite=Lax`;
}

function deserialize<T>(raw: string | undefined): T | undefined {
	if (raw === undefined) return undefined;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return raw as T;
	}
}

function serialize<T>(value: T): string {
	if (typeof value === "string") return value;
	if (typeof value === "number") return String(value);
	return JSON.stringify(value);
}

export function useCookie<T>(
	name: string,
	scope: string,
): [value: T | undefined, setValue: (value: T | undefined) => boolean] {
	const cookieName = `${scope}.${name}`;

	const hasConsent = useConsent(scope);
	const context = useContext(CookieConsentContext);

	const scopeConfig = useMemo(
		() => context?.scopes.find((s) => s.scope === scope) ?? null,
		[context?.scopes, scope],
	);

	const [value, setValue] = useState<T | undefined>(() => {
		if (!hasConsent) return undefined;
		return deserialize<T>(getCookie(cookieName));
	});

	useEffect(() => {
		if (!hasConsent) {
			setValue(undefined);
			return;
		}
		setValue(deserialize<T>(getCookie(cookieName)));
	}, [cookieName, hasConsent]);

	const setCookieValue = useCallback(
		(newValue: T | undefined): boolean => {
			if (!hasConsent || !scopeConfig) return false;
			if (newValue === undefined) {
				deleteCookie(cookieName, scopeConfig.path);
				setValue(undefined);
				return true;
			}
			setCookie(
				cookieName,
				serialize(newValue),
				scopeConfig.path,
				scopeConfig.maxAge,
			);
			setValue(newValue);
			return true;
		},
		[cookieName, hasConsent, scopeConfig],
	);

	if (!hasConsent) return [undefined, () => false];

	return [value, setCookieValue];
}
