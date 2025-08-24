"use client";

import "../scss/main.scss";
import Header from "@/components/header/Header";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { StrictMode } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
          <SessionProvider>
            <Header />
            {children}
            <Toaster
              position="bottom-right"
              expand={true}
              richColors
              closeButton
              maxToasts={5}
            />
          </SessionProvider>
      </body>
    </html>
  );
}
