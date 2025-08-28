import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Define extended invoice interface for type safety
interface ExpandedInvoice extends Stripe.Invoice {
  payment_intent?: string | Stripe.PaymentIntent;
}

export async function POST(req: Request) {
  const { customerId, priceId } = await req.json();

  if (!customerId || !priceId) {
    return new NextResponse("Customer Id or price id is missing", { status: 400 });
  }

  const agency = await db.agency.findFirst({
    where: { customerId },
    include: { Subscription: true },
  });

  try {
    let subscription: Stripe.Subscription;
    let clientSecret: string;

    // If user has an active subscription → Update
    if (agency?.Subscription?.subscriptionId && agency.Subscription.active) {
      console.log("🔄 Updating existing subscription:", agency.Subscription.subscriptionId);
      
      const current = await stripe.subscriptions.retrieve(agency.Subscription.subscriptionId);

      subscription = await stripe.subscriptions.update(agency.Subscription.subscriptionId, {
        items: [
          { id: current.items.data[0].id, deleted: true },
          { price: priceId },
        ],
        expand: ["latest_invoice.payment_intent"],
      });

      clientSecret = await getClientSecretFromSubscription(subscription);
    } else {
      // Create subscription with proper payment behavior
      console.log("🆕 Creating new subscription for customer:", customerId);
      
      subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
        metadata: {
          agencyId: agency?.id || ''
        }
      });

      clientSecret = await getClientSecretFromSubscription(subscription);
    }

    console.log("✅ Subscription processed:", {
      subscriptionId: subscription.id,
      hasClientSecret: !!clientSecret,
      status: subscription.status
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret,
    });
  } catch (err) {
    console.error("🔴 Error creating/updating subscription:", err);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Server Error", 
        message: err instanceof Error ? err.message : "Unknown error" 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Helper function to extract client secret with multiple fallback methods
async function getClientSecretFromSubscription(subscription: Stripe.Subscription): Promise<string> {
  console.log("🔍 Analyzing subscription for client secret:", {
    id: subscription.id,
    status: subscription.status,
    latest_invoice: typeof subscription.latest_invoice,
    latest_invoice_id: typeof subscription.latest_invoice === 'string' 
      ? subscription.latest_invoice 
      : subscription.latest_invoice?.id
  });

  // Method 1: Try to get from expanded latest_invoice.payment_intent
  if (subscription.latest_invoice && typeof subscription.latest_invoice === 'object') {
    const invoice = subscription.latest_invoice as any;
    console.log("📄 Expanded invoice found:", {
      id: invoice.id,
      payment_intent: typeof invoice.payment_intent,
      payment_intent_id: typeof invoice.payment_intent === 'string' 
        ? invoice.payment_intent 
        : invoice.payment_intent?.id
    });
    
    if (invoice.payment_intent) {
      if (typeof invoice.payment_intent === 'object' && invoice.payment_intent.client_secret) {
        console.log("✅ Found client secret in expanded payment intent");
        return invoice.payment_intent.client_secret;
      } else if (typeof invoice.payment_intent === 'string') {
        // Payment intent is just an ID, fetch it
        console.log("🔄 Fetching payment intent by ID:", invoice.payment_intent);
        const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
        if (paymentIntent.client_secret) {
          console.log("✅ Found client secret from fetched payment intent");
          return paymentIntent.client_secret;
        }
      }
    }
  }

  // Method 2: Fetch the invoice separately if latest_invoice is just an ID
  if (subscription.latest_invoice && typeof subscription.latest_invoice === 'string') {
    console.log("🔄 Fetching invoice separately:", subscription.latest_invoice);
    try {
      const invoice = await stripe.invoices.retrieve(subscription.latest_invoice, {
        expand: ['payment_intent']
      });
      
      // Use type assertion to access expanded payment_intent
      const expandedInvoice = invoice as any;
      if (expandedInvoice.payment_intent && typeof expandedInvoice.payment_intent === 'object') {
        const paymentIntent = expandedInvoice.payment_intent as Stripe.PaymentIntent;
        if (paymentIntent.client_secret) {
          console.log("✅ Found client secret from separately fetched invoice");
          return paymentIntent.client_secret;
        }
      }
    } catch (invoiceError) {
      console.error("❌ Failed to fetch invoice:", invoiceError);
    }
  }

  // Method 3: List payment intents for this customer and find the most recent one
  console.log("🔄 Searching for recent payment intents...");
  try {
    const paymentIntents = await stripe.paymentIntents.list({
      customer: subscription.customer as string,
      limit: 5,
    });
    
    // Look for a payment intent created recently (within last 5 minutes)
    const recentPaymentIntent = paymentIntents.data.find(pi => {
      const createdTime = pi.created * 1000;
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      return createdTime > fiveMinutesAgo && pi.status === 'requires_payment_method';
    });
    
    if (recentPaymentIntent?.client_secret) {
      console.log("✅ Found client secret from recent payment intent");
      return recentPaymentIntent.client_secret;
    }
  } catch (piError) {
    console.error("❌ Failed to search payment intents:", piError);
  }

  // Method 4: Create a new payment intent manually as last resort
  console.log("🔧 Creating manual payment intent as fallback...");
  try {
    // Get the price to determine amount
    const price = await stripe.prices.retrieve(subscription.items.data[0].price.id);
    const amount = price.unit_amount || 0;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: price.currency,
      customer: subscription.customer as string,
      setup_future_usage: 'off_session',
      metadata: {
        subscription_id: subscription.id,
        type: 'manual_fallback'
      }
    });
    
    if (paymentIntent.client_secret) {
      console.log("✅ Created manual payment intent successfully");
      return paymentIntent.client_secret;
    }
  } catch (manualError) {
    console.error("❌ Failed to create manual payment intent:", manualError);
  }

  // If all methods fail
  throw new Error(`Unable to obtain client secret for subscription ${subscription.id}`);
}
