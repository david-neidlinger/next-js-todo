import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD7YFiTPLPnmUjbPnNI0jGZ9xxC8m9Cc-Q",
    authDomain: "next-todo-app-5bc61.firebaseapp.com",
    projectId: "next-todo-app-5bc61",
    storageBucket: "next-todo-app-5bc61.appspot.com",
    messagingSenderId: "794745196014",
    appId: "1:794745196014:web:dc768862546c0d1d24d2ff",
    measurementId: "G-BWBQ8DVCZ4"
  };

  
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };