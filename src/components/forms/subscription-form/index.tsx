"use client";

import { Button } from "@/components/ui/button";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { toast } from "sonner";
import { useModal } from "@/providers/modal-provider";
import { useRouter } from "next/navigation";

type Props = {
  selectedPriceId: string;
  isSetupIntent?: boolean;
};

const SubscriptionForm = ({ selectedPriceId, isSetupIntent = false }: Props) => {
  const elements = useElements();
  const stripeHook = useStripe();
  const [priceError, setPriceError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setClose } = useModal();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (!selectedPriceId) {
      setPriceError("You need to select a plan to subscribe.");
      return;
    }
    setPriceError("");
    event.preventDefault();
    if (!stripeHook || !elements) return;

    setIsLoading(true);

    try {
      // Use confirmPayment with redirect handling
      const { error, paymentIntent } = await stripeHook.confirmPayment({
        elements,
        redirect: 'if_required', // Prevent automatic redirect
        confirmParams: {
          return_url: `${window.location.origin}/agency/billing/success`,
        },
      });
      
      if (error) {
        throw new Error(error.message || 'Payment failed');
      }

      // Payment succeeded
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log("✅ Payment confirmed successfully:", paymentIntent.id);
        
        toast.success("Your payment has been successfully processed!");
        setClose();
        
        // Wait a bit for webhooks to process, then refresh
        setTimeout(() => {
          router.refresh();
          window.location.href = '/agency/billing';
        }, 3000);
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "We couldn't process your payment. Please try a different card"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <small className="text-destructive">{priceError}</small>
      <PaymentElement />
      <Button disabled={!stripeHook || isLoading} className="mt-4 w-full">
        {isLoading ? "Processing..." : "Submit"}
      </Button>
    </form>
  );
};

export default SubscriptionForm;
