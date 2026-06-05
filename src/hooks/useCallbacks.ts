import { useContext, useEffect, useRef } from "react";
import { CookieConsentContext } from "../context";

export function useOnConsentChange(
	callback: (consent: Record<string, boolean>) => void,
) {
	const context = useContext(CookieConsentContext);
	if (context === null)
		throw new Error("useOnConsentChange must be used within a CookieProvider");

	const callbackRef = useRef(callback);
	callbackRef.current = callback;

	useEffect(() => {
		return context.registerOnConsentChange((consent) => {
			callbackRef.current(consent);
		});
	}, [context.registerOnConsentChange]);
}

export function useOnAcceptAll(callback: () => void) {
	const context = useContext(CookieConsentContext);
	if (context === null)
		throw new Error("useOnAcceptAll must be used within a CookieProvider");

	const callbackRef = useRef(callback);
	callbackRef.current = callback;

	useEffect(() => {
		return context.registerOnAcceptAll(() => {
			callbackRef.current();
		});
	}, [context.registerOnAcceptAll]);
}

export function useOnRejectAll(callback: () => void) {
	const context = useContext(CookieConsentContext);
	if (context === null)
		throw new Error("useOnRejectAll must be used within a CookieProvider");

	const callbackRef = useRef(callback);
	callbackRef.current = callback;

	useEffect(() => {
		return context.registerOnRejectAll(() => {
			callbackRef.current();
		});
	}, [context.registerOnRejectAll]);
}
