import './globals.css';
import { Suspense } from 'react';
import Navbar from './navbar/Navbar';
import { ClerkProvider, SignedIn, SignedOut, SignIn } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-gray-100 min-h-screen">
          <SignedOut>
            <div className="flex justify-center items-center min-h-screen">
              <SignIn routing="hash" />
            </div>
          </SignedOut>
          <SignedIn>
            <Suspense fallback={<div>Loading...</div>}>
              <Navbar>
                {children}
              </Navbar>
            </Suspense>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}
