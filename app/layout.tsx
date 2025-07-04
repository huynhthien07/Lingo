import { ExitModal } from '@/components/modals/exit-modal';
import { ExitTestModal } from '@/components/modals/exit-test-modal';
import { HeartsModal } from '@/components/modals/hearts-modal';
import { PracticeModal } from '@/components/modals/practice-modal';
import { Toaster } from '@/components/ui/sonner';
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
      <html lang="en">
        <body
          className={font.className}
        >
          <Toaster />
          <ExitModal />
          <ExitTestModal />
          <HeartsModal />
          <PracticeModal />
          <LoginTracker />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
