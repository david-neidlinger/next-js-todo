import CheckoutButton from "@/components/features/checkout/CheckoutButton";
import { auth } from "@clerk/nextjs/server";

export default async function SimpleCheckoutPage() {
  const { userId } = auth();

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Please log in to access the checkout.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-8">Simple Checkout</h1>
      <CheckoutButton userId={userId} priceId="price_1N5mDALOLipejsn2vx6jLrif" planName="Standard" />
      <CheckoutButton userId={userId} priceId="price_1N5mE6LOLipejsn225LNxeHp" planName="Pro" />
      <CheckoutButton userId={userId} priceId="price_1N5mElLOLipejsn2hkEAGZl5" planName="Executive" />
    </div>
  );
}