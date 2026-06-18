// Mock Stripe integration
class StripeWrapper {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    console.log("Stripe initialized in test mode.");
  }

  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<string> {
    console.log(`Creating payment intent for ${amount} ${currency}...`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return `pi_${Math.random().toString(36).substring(2, 15)}`;
  }

  async processWebhook(payload: any, signature: string): Promise<boolean> {
    console.log("Processing Stripe webhook...");
    if (!signature) throw new Error("Missing signature");
    
    if (payload.type === 'payment_intent.succeeded') {
      console.log(`Payment succeeded for intent: ${payload.data.object.id}`);
      return true;
    }
    return false;
  }
}

export const paymentService = new StripeWrapper('sk_test_mock_key');

// Example usage
async function run() {
  const intentId = await paymentService.createPaymentIntent(5000);
  console.log(`Created Intent: ${intentId}`);
}

run();