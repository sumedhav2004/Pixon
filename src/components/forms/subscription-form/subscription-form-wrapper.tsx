"use client";

import Loading from "@/components/global/loading";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { pricingCards } from "@/lib/constants";
import { useModal } from "@/providers/modal-provider";
import { Plan } from "@prisma/client";
import { StripeElementsOptions } from "@stripe/stripe-js";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/stripe-client";
import SubscriptionForm from ".";
import { toast } from "sonner";

type Props = {
  customerId: string;
  planExists: boolean;
};

const SubscriptionFormWrapper = ({ customerId, planExists }: Props) => {
  const { data, setClose } = useModal();
  const router = useRouter();
  const [selectedPriceId, setSelectedPriceId] = useState<Plan | "">(
    data?.plans?.defaultPriceId || ""
  );
  const [subscription, setSubscription] = useState<{
    subscriptionId: string;
    clientSecret: string;
  }>({ subscriptionId: "", clientSecret: "" });

  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret: subscription?.clientSecret,
      appearance: {
        theme: "flat",
      },
    }),
    [subscription]
  );

  useEffect(() => {
    if (!selectedPriceId) return;
    const createOrUpdateSubscription = async () => {
      try {
        const res = await fetch("/api/stripe/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId, priceId: selectedPriceId }),
        });
        const result = await res.json();

        if (!res.ok) throw new Error(result.message || "Subscription failed");

        setSubscription({
          clientSecret: result.clientSecret,
          subscriptionId: result.subscriptionId,
        });

        if (planExists) {
          toast.success("Your plan has been successfully upgraded!");
          setClose();
          router.refresh();
        }
      } catch (error) {
        console.error("❌ Subscription setup failed:", error);
        toast.error("Failed to initialize subscription. Try again.");
      }
    };
    createOrUpdateSubscription();
  }, [data, selectedPriceId, customerId]);

  return (
    <div className="border-none transition-all">
      <div className="flex flex-col gap-4">
        {data.plans?.plans.map((price) => (
          <Card
            onClick={() => setSelectedPriceId(price.id as Plan)}
            key={price.id}
            className={clsx("relative cursor-pointer transition-all", {
              "border-primary": selectedPriceId === price.id,
            })}
          >
            <CardHeader>
              <CardTitle>
                ${price.unit_amount ? price.unit_amount / 100 : "0"}
                <p className="text-sm text-muted-foreground">{price.nickname}</p>
                <p className="text-sm text-muted-foreground">
                  {pricingCards.find((p) => p.priceId === price.id)?.description}
                </p>
              </CardTitle>
            </CardHeader>
            {selectedPriceId === price.id && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-4 right-4" />
            )}
          </Card>
        ))}
        {options.clientSecret && !planExists && (
          <>
            <h1 className="text-xl">Payment Method</h1>
            <Elements stripe={getStripe()} options={options}>
              <SubscriptionForm selectedPriceId={selectedPriceId} />
            </Elements>
          </>
        )}

        {!options.clientSecret && selectedPriceId && (
          <div className="flex items-center justify-center w-full h-40">
            <Loading />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionFormWrapper;