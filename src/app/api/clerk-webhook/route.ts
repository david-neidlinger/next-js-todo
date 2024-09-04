import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { auth as adminAuth, db as adminDb } from '@/lib/firebase_admin';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created' && 'email_addresses' in evt.data) {
    const email_addresses = evt.data.email_addresses;
    try {
      const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id);
      if (!primaryEmail) {
        throw new Error('No primary email address found');
      }
      
      // Check if the user already exists in Firebase
      try {
        const userRecord = await adminAuth.getUser(id!);
        // User exists, update their information
        await adminAuth.updateUser(id!, {
          email: primaryEmail.email_address,
          emailVerified: primaryEmail.verification?.status === 'verified',
        });
        console.log('User updated in Firebase:', id);
      } catch (error) {
        // User doesn't exist, create a new user
        await adminAuth.createUser({
          uid: id,
          email: primaryEmail.email_address,
          emailVerified: primaryEmail.verification?.status === 'verified',
        });
        console.log('User created in Firebase:', id);
      }
      
      // Update or create user document in Firestore
      await adminDb.collection('accounts').doc(id!).set({
        email: primaryEmail.email_address,
        createdAt: new Date(),
        lastLogin: new Date(),
      }, { merge: true });
      
      console.log('User updated/created in Firestore:', id, 'with email:', primaryEmail.email_address);
    } catch (error) {
      console.error('Error handling user in Firebase or Firestore:', error);
      return new Response('Error handling user', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}
