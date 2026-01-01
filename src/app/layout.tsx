// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Paygentic PIE - Pricing Intelligence Engine",
  description: "AI-powered pricing optimization and revenue leak detection for AI-native companies. Built for Paygentic by Antipas Pezos.",
  keywords: ["pricing intelligence", "revenue optimization", "AI billing", "churn prediction", "Paygentic"],
  authors: [{ name: "Antipas Pezos" }],
  openGraph: {
    title: "Paygentic PIE - Pricing Intelligence Engine",
    description: "Turn pricing guesswork into data-driven decisions",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}