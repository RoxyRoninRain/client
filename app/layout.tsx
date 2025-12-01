import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://akitaconnect.com"),
  title: {
    default: "Akita Connect - The Premier Community for Akita Owners",
    template: "%s | Akita Connect",
  },
  description: "Join the largest community of Akita owners, breeders, and enthusiasts. Find puppies, discuss health, and connect with others.",
  keywords: ["Akita", "Japanese Akita", "American Akita", "Dog Community", "Puppies", "Breeder Directory"],
  authors: [{ name: "Akita Connect Team" }],
  openGraph: {
    title: "Akita Connect - The Premier Community for Akita Owners",
    description: "Join the largest community of Akita owners, breeders, and enthusiasts.",
    siteName: "Akita Connect",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Akita Connect Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Akita Connect",
    description: "The premier platform for Akita owners and breeders.",
    images: ["/logo.png"],
  },
};

import { createClient } from "@/utils/supabase/server";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ScrollToTop />
        <Navbar user={user} />
        {children}
      </body>
    </html>
  );
}
