import Stripe from 'stripe';

// ============================================================================
// STRIPE CLIENT (backend only)
// ============================================================================
// Este cliente solo se usa en API routes (/src/app/api/**).
// NUNCA importar desde componentes client-side.
// ============================================================================

// Lazy initialization — avoids throwing at build time during static page collection
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing STRIPE_SECRET_KEY in environment variables');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    });
  }
  return _stripe;
}

// Named export for backward compatibility
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

// ============================================================================
// PRICE IDs (AFIRMIA products in Stripe)
// ============================================================================

export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY!,
  PRO_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY!,
  PREMIUM_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY!,
  PREMIUM_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY!,
} as const;

// ============================================================================
// PLAN TYPES
// ============================================================================

export type PlanTier = 'free' | 'pro' | 'premium';
export type BillingCycle = 'monthly' | 'yearly';

// ============================================================================
// HELPERS
// ============================================================================

export function getPlanFromPriceId(priceId: string): {
  tier: PlanTier;
  cycle: BillingCycle;
} | null {
  switch (priceId) {
    case STRIPE_PRICES.PRO_MONTHLY:
      return { tier: 'pro', cycle: 'monthly' };
    case STRIPE_PRICES.PRO_YEARLY:
      return { tier: 'pro', cycle: 'yearly' };
    case STRIPE_PRICES.PREMIUM_MONTHLY:
      return { tier: 'premium', cycle: 'monthly' };
    case STRIPE_PRICES.PREMIUM_YEARLY:
      return { tier: 'premium', cycle: 'yearly' };
    default:
      return null;
  }
}

export function isValidPriceId(priceId: string): boolean {
  return Object.values(STRIPE_PRICES).includes(priceId);
}
