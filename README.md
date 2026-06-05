# clonkie

[![npm version](https://badge.fury.io/js/clonkie.svg)](https://www.npmjs.com/package/clonkie)
[![bundle size](https://badgen.net/bundlephobia/min/clonkie)](https://bundlephobia.com/package/clonkie)
[![peer dependencies](https://badgen.net/bundlephobia/dependency-count/clonkie)](https://www.npmjs.com/package/clonkie)

A lightweight React library for managing cookies and consent.

## Quick start

```tsx
import { CookieProvider, useConsent, useCookie, useCookieBanner } from "clonkie";

const SCOPES = [{ scope: "analytics" }, { scope: "marketing" }];

function App() {
  return (
    <CookieProvider scopes={SCOPES}>
      <Page />
      <Banner />
    </CookieProvider>
  );
}

function Page() {
  const analytics = useConsent("analytics");
  const [userId, setUserId] = useCookie<string>("user_id", "essential");
  return (
    <div>
      <p>Analytics: {analytics ? "on" : "off"}</p>
      <input value={userId ?? ""} onChange={(e) => setUserId(e.target.value)} />
    </div>
  );
}

function Banner() {
  const banner = useCookieBanner();
  if (!banner.isOpen) return null;
  return (
    <div>
      <button onClick={banner.acceptAll}>Accept</button>
      <button onClick={banner.rejectAll}>Reject</button>
    </div>
  );
}
```

## Installation

```sh
npm install clonkie
yarn add clonkie
pnpm add clonkie
bun add clonkie
```

**Peer dependencies:** `react` ^18.0.0 || ^19.0.0. Make sure these are installed in your project.

## API Reference

### CookieProvider

Wraps your app with a consent context. Automatically injects an `"essential"` scope if not provided.

**Props:**

| Prop     | Type           | Required |
|----------|----------------|----------|
| `scopes` | `CookieScope[]` | Yes      |
| `children` | `ReactNode`  | Yes      |

### CookieScope

| Field     | Type       | Default     |
|-----------|------------|-------------|
| `scope`   | `string`   | —           |
| `path`    | `string`   | `"/"`       |
| `maxAge`  | `number`   | `31536000`  |
| `domain`  | `string`   | current domain |
| `secure`  | `boolean`  | `true`      |
| `sameSite` | `"strict" \| "lax" \| "none"` | `"lax"` |

### useConsent(scope)

```ts
function useConsent(scope: string): boolean;
```

Returns `true` if the given scope is consented. The `"essential"` scope always returns `true`.

### useCookie\<T>(name, scope)

```ts
function useCookie<T>(name: string, scope: string): [T | undefined, (value: T) => boolean];
```

Returns a tuple of the current cookie value and a setter. The setter respects consent — if consent for the scope is denied, the cookie is **deleted** and the setter returns `false` (no-op).

### useCookieBanner()

```ts
function useCookieBanner(): {
  isOpen: boolean;
  setBannerOpen: (open: boolean) => void;
  consent: Record<string, boolean>;
  setConsent: (consent: Record<string, boolean>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  applySelection: () => void;
};
```

Draft-based consent UI hook. Changes made via `setConsent`, `acceptAll`, or `rejectAll` are held in local state and only applied to the context when `applySelection()` is called.

### useOnAcceptAll(fn)

```ts
function useOnAcceptAll(fn: () => void): void;
```

Registers a side-effect callback that fires when all scopes are accepted.

### useOnRejectAll(fn)

```ts
function useOnRejectAll(fn: () => void): void;
```

Registers a side-effect callback that fires when all non-essential scopes are rejected.

### useOnConsentChange(fn)

```ts
function useOnConsentChange(fn: (consent: Record<string, boolean>) => void): void;
```

Subscribes to any consent state change. The callback receives the full consent map.

## Recipes

### Load Google Analytics on consent

```tsx
import { useConsent } from "clonkie";
import { useEffect } from "react";

function Analytics() {
  const consented = useConsent("analytics");
  useEffect(() => {
    if (consented) {
      // load gtag / GA script
    }
  }, [consented]);
  return null;
}
```

### Persist user preferences with useCookie

```tsx
const [theme, setTheme] = useCookie<"light" | "dark">("theme", "essential");
```

Since `"essential"` consent is always granted, the cookie is always available.

### Persist consent to localStorage

```tsx
import { useOnConsentChange } from "clonkie";

function ConsentLogger() {
  useOnConsentChange((consent) => {
    localStorage.setItem("consent", JSON.stringify(consent));
  });
  return null;
}
```
