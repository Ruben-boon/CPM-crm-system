"use client";

import "../scss/main.scss";
import Header from "@/components/header/Header";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, ReactNode, createContext, useContext, useState } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Create a context to share navigation state
interface NavigationContextType {
  currentId: string | null;
  navigateTo: (path: string, id: string | null) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  currentId: null,
  navigateTo: () => {}
});

// Custom hook to use the navigation context
export const useNavigation = () => useContext(NavigationContext);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // Update currentId when URL changes
  useEffect(() => {
    setCurrentId(id);
  }, [id]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // The URL has already changed by the time this event fires,
      // so we don't need to do anything here.
      // The effect above will handle setting the currentId.
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Function to navigate to a specific path with an ID
  const navigateTo = (path: string, id: string | null) => {
    // If the path is the same as the current path, just update the ID
    if (path === pathname) {
      // Update state first
      setCurrentId(id);
      
      // Then update URL
      const newUrl = id ? `${path}?id=${id}` : path;
      window.history.pushState({ id }, '', newUrl);
    } else {
      // If it's a different path, use Next.js router
      if (id) {
        router.push(`${path}?id=${id}`);
      } else {
        router.push(path);
      }
    }
  };

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <NavigationContext.Provider value={{ currentId, navigateTo }}>
          <Header />
          <main>{children}</main>
          <Toaster
            position="bottom-right"
            expand={false}
            richColors
            closeButton
          /> 
        </NavigationContext.Provider>
      </body>
    </html>
  );
}