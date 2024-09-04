'use client';

import Link from 'next/link';
import { UserButton, useUser } from "@clerk/nextjs";

export default function Navbar({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();

  return (
    <>
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <Link href="/" className="text-gray-800 hover:text-gray-600">Home</Link>
            <Link href="/todos" className="text-gray-800 hover:text-gray-600">ToDos</Link>
          </div>
          {isSignedIn && <UserButton afterSignOutUrl="/" />}
        </div>
      </nav>
      <main className="container mx-auto mt-8 p-4">
        {children}
      </main>
    </>
  );
}
