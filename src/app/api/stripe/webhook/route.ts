import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { stripe, getPlanFromPriceId } from '@/lib/stripe';

// Supabase admin client (service role) — bypasses RLS for webhook writes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('[stripe-webhook] Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[stripe-webhook] Signature verification failed:', msg);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  console.log(`[stripe-webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[stripe-webhook] Handler error for ${event.type}:`, msg);
    // Return 200 so Stripe doesn't retry on our bugs — we log for manual review
    return NextResponse.json({ received: true, error: msg }, { status: 200 });
  }
}

/**
 * checkout.session.completed — fired when user completes initial payment
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;
  const subscriptionId = session.subscription as string | null;
  const customerId = session.customer as string | null;

  if (!userId) {
    console.error('[stripe-webhook] checkout.session.completed missing supabase_user_id in metadata');
    return;
  }

  if (!subscriptionId) {
    console.error('[stripe-webhook] checkout.session.completed missing subscription id');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error('[stripe-webhook] No price_id in subscription', subscriptionId);
    return;
  }

  const plan = getPlanFromPriceId(priceId);
  if (!plan) {
    console.error('[stripe-webhook] Unknown price_id:', priceId);
    return;
  }

  const periodEnd = new Date((subscription as any).current_period_end * 1000).toISOString();

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan: plan.tier,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: subscription.status,
      subscription_period_end: periodEnd,
      current_price_id: priceId,
    })
    .eq('id', userId);

  if (error) {
    console.error('[stripe-webhook] Failed to update profile on checkout:', error);
    throw error;
  }

  console.log(`[stripe-webhook] ✅ User ${userId} upgraded to ${plan.tier} (${plan.cycle})`);
}

/**
 * customer.subscription.updated — fired on renewals, upgrades, downgrades
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error('[stripe-webhook] subscription.updated missing price_id');
    return;
  }

  const plan = getPlanFromPriceId(priceId);
  if (!plan) {
    console.error('[stripe-webhook] Unknown price_id on update:', priceId);
    return;
  }

  const periodEnd = new Date((subscription as any).current_period_end * 1000).toISOString();

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan: plan.tier,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_period_end: periodEnd,
      current_price_id: priceId,
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('[stripe-webhook] Failed to update profile on subscription.updated:', error);
    throw error;
  }

  console.log(`[stripe-webhook] ✅ Customer ${customerId} updated to ${plan.tier} (${subscription.status})`);
}

/**
 * customer.subscription.deleted — fired when subscription fully cancels
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan: 'free',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      current_price_id: null,
      // Keep stripe_customer_id so user can resubscribe with same customer
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('[stripe-webhook] Failed to downgrade profile:', error);
    throw error;
  }

  console.log(`[stripe-webhook] ✅ Customer ${customerId} downgraded to free`);
}
