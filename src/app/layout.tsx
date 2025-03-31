"use client";

import "../scss/main.scss";
import Header from "@/components/header/Header";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import { AppWrapper } from "@/components/AppWrapper";

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
        <AppWrapper>
          <Header />
          {children}
          <Toaster
            position="bottom-right"
            expand={false}
            richColors
            closeButton
          />
        </AppWrapper>
      </body>
    </html>
  );
}