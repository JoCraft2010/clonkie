function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getCookie(name: string): string | undefined {
	if (typeof document === "undefined") return undefined;
	const match = document.cookie.match(
		new RegExp(`(?:^|;\\s*)${escapeRegExp(name)}=(.*?)(?:;|$)`),
	);
	return match ? decodeURIComponent(match[1]) : undefined;
}

export function setCookie(
	name: string,
	value: string,
	path: string,
	maxAge: number,
): void {
	if (typeof document === "undefined") return;
	// biome-ignore lint/suspicious/noDocumentCookie: cookie library
	document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};path=${path};max-age=${maxAge};SameSite=Lax`;
}

export function deleteCookie(name: string, path: string): void {
	if (typeof document === "undefined") return;
	// biome-ignore lint/suspicious/noDocumentCookie: cookie library
	document.cookie = `${encodeURIComponent(name)}=;path=${path};max-age=0;SameSite=Lax`;
}
