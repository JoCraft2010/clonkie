import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CookieConsentContext } from "../context";
import { deleteCookie, getCookie, setCookie } from "../utils/cookie";
import { useConsent } from "./useConsent";

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
			deleteCookie(cookieName, {
				path: scopeConfig?.path ?? "/",
				domain: scopeConfig?.domain,
				secure: scopeConfig?.secure,
				sameSite: scopeConfig?.sameSite,
			});
			setValue(undefined);
			return;
		}
		setValue(deserialize<T>(getCookie(cookieName)));
	}, [cookieName, hasConsent, scopeConfig]);

	const setCookieValue = useCallback(
		(newValue: T | undefined): boolean => {
			if (!hasConsent || !scopeConfig) return false;
			if (newValue === undefined) {
				deleteCookie(cookieName, {
					path: scopeConfig.path,
					domain: scopeConfig.domain,
					secure: scopeConfig.secure,
					sameSite: scopeConfig.sameSite,
				});
				setValue(undefined);
				return true;
			}
			setCookie(cookieName, serialize(newValue), {
				path: scopeConfig.path,
				maxAge: scopeConfig.maxAge,
				domain: scopeConfig.domain,
				secure: scopeConfig.secure,
				sameSite: scopeConfig.sameSite,
			});
			setValue(newValue);
			return true;
		},
		[cookieName, hasConsent, scopeConfig],
	);

	if (!hasConsent) return [undefined, () => false];

	return [value, setCookieValue];
}
