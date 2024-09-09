import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: Request) {
  const { userId, priceId, subscriptionName } = await request.json();
  const stripeCustomerId = "cus_QnIPvNMyVjcaNN"; // TODO: Fetch this from your database

  try {
    const session = await createSubscriptionCheckoutSession(stripeCustomerId, priceId, userId);
    // const session = await createSetupCheckoutSession(stripeCustomerId, priceId, userId, subscriptionName);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error creating session' }, { status: 500 });
  }
}

async function createSetupCheckoutSession(stripeCustomerId: string, priceId: string, userId: string, subscriptionName: string) {
    return await stripe.checkout.sessions.create({
        mode: 'setup',
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        setup_intent_data: {
          metadata: {
            description: 'Purchase the ' + subscriptionName + ' subscription',
            priceId: priceId,
            userId: userId,
          },
        },
        billing_address_collection: 'required',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/simple-checkout`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/simple-checkout`,
      });
}

async function createSubscriptionCheckoutSession(stripeCustomerId: string, priceId: string, userId: string) {
  // Fetch the customer to check for a default payment method
  const customer = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
  
  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    billing_address_collection: 'required',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/simple-checkout`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/simple-checkout`,
    client_reference_id: userId,
    payment_method_collection: 'always',
    payment_method_data: {
        allow_redisplay: 'always',
      },
  };

  return await stripe.checkout.sessions.create(sessionConfig);
}

async function createTestCheckoutSession(priceId: string, userId: string, subscriptionName: string) {
    return await stripe.checkout.sessions.create({
        mode: 'setup',
        payment_method_types: ['card'],
        customer_creation: 'always',
        setup_intent_data: {
          metadata: {
            description: 'Purchase the ' + subscriptionName + ' subscription',
            priceId: priceId,
            userId: userId,
          },
        },
        billing_address_collection: 'required',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/simple-checkout`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/simple-checkout`,
      });
}