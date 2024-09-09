'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

interface CheckoutButtonProps {
  userId: string;
  priceId: string;
  planName: string;
}

export default function CheckoutButton({ userId, priceId, planName }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    console.log("handleCheckout called"); // Add this line
    setIsLoading(true);
    try {
        console.log("creating session")
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, priceId, planName }),
      });
      const { sessionId } = await response.json();
      console.log("sessionId", sessionId)
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      console.log("stripe", stripe)
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Rendering CheckoutButton"); // Add this line

  return (
    <button
      onClick={() => {
        console.log("Button clicked"); // Add this line
        handleCheckout();
      }}
      disabled={isLoading}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      {isLoading ? 'Loading...' : `Change to: ${planName}`}
    </button>
  );
}