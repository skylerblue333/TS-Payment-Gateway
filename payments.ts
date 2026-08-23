import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export async function createCheckout(priceId: string, successUrl: string, cancelUrl: string) {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY must be configured");
  return stripe.checkout.sessions.create({ mode: "payment", line_items: [{ price: priceId, quantity: 1 }], success_url: successUrl, cancel_url: cancelUrl });
}
