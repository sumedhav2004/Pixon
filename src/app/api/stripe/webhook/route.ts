import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { subscriptionCreated } from "@/lib/stripe/stripe-action";

// Define extended invoice interface
interface ExtendedInvoice extends Stripe.Invoice {
  subscription?: string | Stripe.Subscription;
}

const eventsToHandle = new Set([
  "customer.subscription.created",
  "customer.subscription.updated", 
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "payment_intent.succeeded"
]);

export async function POST(req: NextRequest) {
  let event: Stripe.Event;
  const sig = (await headers()).get("Stripe-Signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    console.log("🔴 Missing Stripe webhook signature or secret.");
    return new NextResponse("Webhook config error", { status: 400 });
  }

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: any) {
    console.log("🔴 Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    console.log(`📨 Webhook received: ${event.type}`);

    if (eventsToHandle.has(event.type)) {
      
      // Handle subscription events
      if (event.type.startsWith('customer.subscription.')) {
        const subscription = event.data.object as Stripe.Subscription;

        if (
          !subscription.metadata?.connectAccountPayments &&
          !subscription.metadata?.connectAccountSubscriptions
        ) {
          console.log(`🔄 Processing subscription ${event.type}:`, {
            subscriptionId: subscription.id,
            status: subscription.status,
            customerId: subscription.customer
          });

          await subscriptionCreated(subscription, subscription.customer as string);
          console.log(`✅ Webhook handled: ${event.type}`);
        }
      }

      // Handle successful invoice payment
      if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object as ExtendedInvoice;
        
        if (invoice.subscription) {
          console.log(`💳 Invoice paid for subscription: ${invoice.subscription}`);
          
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          await subscriptionCreated(subscription, subscription.customer as string);
          console.log(`✅ Subscription activated via invoice payment`);
        }
      }

      // Handle successful payment intent
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        if (paymentIntent.metadata?.subscription_id) {
          console.log(`💳 Payment succeeded for subscription: ${paymentIntent.metadata.subscription_id}`);
          
          const subscription = await stripe.subscriptions.retrieve(paymentIntent.metadata.subscription_id);
          await subscriptionCreated(subscription, subscription.customer as string);
          console.log(`✅ Subscription activated via payment intent`);
        }
      }
    } else {
      console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("🔴 Error processing webhook:", err);
    return new NextResponse("Webhook handler failure", { status: 500 });
  }
}
