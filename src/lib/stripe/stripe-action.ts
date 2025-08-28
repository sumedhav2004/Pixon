'use server'

import Stripe from 'stripe'
import { db } from '../db'
import { stripe } from '.'

export const subscriptionCreated = async (
  subscription: Stripe.Subscription,
  customerId: string
) => {
  try {
    console.log("🔄 Updating database for subscription:", {
      subscriptionId: subscription.id,
      status: subscription.status,
      customerId: customerId,
      priceId: subscription.items.data[0]?.price.id
    });

    const agency = await db.agency.findFirst({
      where: { customerId: customerId },
      include: { Subscription: true },
    });

    if (!agency) {
      console.error("🔴 No agency found for customer:", customerId);
      return;
    }

    // Get subscription data from Stripe
    const priceId = subscription.items.data[0]?.price.id;
    const isActive = true;
    const price = subscription.items.data[0]?.price;

    if (agency.Subscription) {
      // Update existing subscription
      const updated = await db.subscription.update({
        where: { id: agency.Subscription.id },
        data: {
          subscriptionId: subscription.id,
          priceId: priceId,
          active: isActive,
          customerId: customerId,
          currentPeriodEndDate: new Date(),
          price: price?.unit_amount ? `$${price.unit_amount / 100}` : null,
          plan: priceId as any, // Cast to your Plan enum if needed
        },
      });
      console.log("✅ Updated existing subscription:", updated);
    } else {
      // Create new subscription record - ALL REQUIRED FIELDS INCLUDED
      const created = await db.subscription.create({
        data: {
          subscriptionId: subscription.id,        // Required: unique string
          priceId: priceId!,                      // Required: string
          customerId: customerId,                 // Required: string
          currentPeriodEndDate: new Date(), // Required: DateTime
          agencyId: agency.id,                    // Optional: string (unique)
          active: isActive,                       // Optional: boolean (defaults to false)
          price: price?.unit_amount ? `$${price.unit_amount / 100}` : null, // Optional: string
          plan: priceId as any,                   // Optional: Plan enum (cast if needed)
        },
      });
      console.log("✅ Created new subscription:", created);
    }

    console.log("✅ Database updated successfully for subscription:", subscription.id);
  } catch (error) {
    console.error("🔴 Error updating subscription in database:", error);
    throw error;
  }
};

export const getConnectAccountProducts = async (stripeAccount: string) => {
  const products = await stripe.products.list(
    {
      limit: 50,
      expand: ['data.default_price'],
    },
    {
      stripeAccount,
    }
  )
  return products.data
}
