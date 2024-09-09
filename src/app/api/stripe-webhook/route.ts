import { db } from '@/lib/firebase_admin';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    console.log("OOOOO: stripe-webhook")
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  const stripeCustomerId = session.customer as string;

  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object as Stripe.Subscription;
    const planName = subscription.items.data[0].price.nickname as string;
    const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'active',
      });
    for (const sub of subscriptions.data) {
        if (sub.id !== subscription.id) {
            console.log(`Cancelling subscription: ${sub.id}`);
          await stripe.subscriptions.cancel(sub.id);
        }
      }
    console.log(`New subscription created: ${planName}`);
    // Find the account document with matching stripeCustomerId
    const accountsSnapshot = await db.collection('accounts')
        .where('stripeCustomerId', '==', stripeCustomerId)
        .limit(1)
        .get();

    if (!accountsSnapshot.empty) {
        const accountDoc = accountsSnapshot.docs[0];
        await accountDoc.ref.set({
            planName: planName,
        }, { merge: true });
    } else {
        console.error(`No account found with stripeCustomerId: ${stripeCustomerId}`);
    }
  }

  return NextResponse.json({ received: true });
}
