import * as admin from 'firebase-admin';
import credentials from './credentials.json';

if (!admin.apps.length) {
  console.log('Initializing Firebase Admin');
    admin.initializeApp({
      credential: admin.credential.cert({
        privateKey: credentials.private_key,
        clientEmail: credentials.client_email,
        projectId: credentials.project_id,
      }),
      databaseURL: "https://next-todo-app-5bc61.firebaseio.com"
  })
}

export const auth = admin.auth();
export const db = admin.firestore();