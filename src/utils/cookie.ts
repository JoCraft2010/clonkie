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

export interface CookieOptions {
	path: string;
	maxAge: number;
	domain?: string;
	secure?: boolean;
	sameSite?: "Strict" | "Lax" | "None";
}

export interface DeleteCookieOptions {
	path: string;
	domain?: string;
	secure?: boolean;
	sameSite?: "Strict" | "Lax" | "None";
}

function buildCookieString(
	name: string,
	value: string,
	maxAge: number,
	options: {
		path: string;
		domain?: string;
		secure?: boolean;
		sameSite?: "Strict" | "Lax" | "None";
	},
): string {
	const { path, domain, secure = false, sameSite = "Lax" } = options;
	const parts = [
		`${encodeURIComponent(name)}=${value}`,
		`path=${path}`,
		`max-age=${maxAge}`,
		`SameSite=${sameSite}`,
	];
	if (domain) parts.push(`domain=${domain}`);
	if (secure) parts.push("secure");
	return parts.join(";");
}

export function setCookie(
	name: string,
	value: string,
	options: CookieOptions,
): void {
	if (typeof document === "undefined") return;
	const { path, maxAge, domain, secure, sameSite } = options;
	// biome-ignore lint/suspicious/noDocumentCookie: cookie library
	document.cookie = buildCookieString(name, encodeURIComponent(value), maxAge, {
		path,
		domain,
		secure,
		sameSite,
	});
}

export function deleteCookie(name: string, options: DeleteCookieOptions): void {
	if (typeof document === "undefined") return;
	const { path, domain, secure, sameSite } = options;
	// biome-ignore lint/suspicious/noDocumentCookie: cookie library
	document.cookie = buildCookieString(name, "", 0, {
		path,
		domain,
		secure,
		sameSite,
	});
}
