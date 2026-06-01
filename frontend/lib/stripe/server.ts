import Stripe from "stripe";

// Server-only Stripe client. Never import this from a Client Component.
// apiVersion is intentionally omitted so the SDK uses its pinned default,
// which avoids TypeScript literal-version mismatches across stripe releases.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PRICE_ID = process.env.STRIPE_PRICE_ID!;
