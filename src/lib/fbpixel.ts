// Meta Pixel client-side event helper.
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Fire a Meta Pixel standard/custom event from the client. No-op on the server. */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', name, params);
  }
}
