import { ExitModal } from '@/components/modals/exit-modal';
import { ExitTestModal } from '@/components/modals/exit-test-modal';
import { PracticeModal } from '@/components/modals/practice-modal';
import { Toaster } from '@/components/ui/sonner';
import { Toaster as HotToaster } from 'react-hot-toast';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { LoginTracker } from '@/components/login-tracker';

const font = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lingo - Language Learning App",
  description: "Learn, practice and master new languages with Lingo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={font.className}
          suppressHydrationWarning
        >
          <Toaster />
          <HotToaster position="top-center" />
          <ExitModal />
          <ExitTestModal />
          <PracticeModal />
          <LoginTracker />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
