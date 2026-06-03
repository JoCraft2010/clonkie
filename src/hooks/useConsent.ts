import { useContext } from "react";
import { CookieConsentContext } from "../context";

export function useConsent(scope: string): boolean {
	const context = useContext(CookieConsentContext);

	if (context === null) return false;
	if (scope === "essential") return true;

	return context.consent[scope] ?? false;
}
