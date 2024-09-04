'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Cookies from 'js-cookie';
import { User } from 'firebase/auth';

const setTokenCookie = async (user: User) => {
  const token = await user.getIdToken();
  Cookies.set('token', token, { expires: 7 }); // Set cookie for 7 days
};

interface AuthProps {
  user: { uid: string; email: string } | null;
}

export default function Auth({ user }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setTokenCookie(userCredential.user);
      console.log('User created:', userCredential.user);
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          createdAt: new Date(),
          lastLogin: new Date(),
        });
        console.log('User document created in Firestore');
      } catch (firestoreError) {
        console.error('Error creating user document:', firestoreError);
      }
      setEmail('');
      setPassword('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error signing up:', error);
      setError('Failed to sign up');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await setTokenCookie(userCredential.user);
      setEmail('');
      setPassword('');
      setIsModalOpen(false);
    } catch (error) {
      setError('Failed to sign in');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Cookies.remove('token');
    } catch (error) {
      setError('Failed to sign out');
    }
  };

  const closeModal = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  return (
    <div>
      {user ? (
        <button onClick={handleSignOut} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
          Logout
        </button>
      ) : (
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Login
        </button>
      )}
      {isModalOpen && !user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white p-8 rounded-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              signIn(email, password);
            }} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Sign In
              </button>
            </form>
            <button onClick={() => signUp(email, password)} className="w-full mt-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
              Sign Up
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}