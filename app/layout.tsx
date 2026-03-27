import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { UserProvider } from "@/context/UserContext";
import { Providers } from "./providers";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Propus CRM",
  description: "Propus CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-(family-name:--font-montserrat)">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <Providers>
            <UserProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </UserProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
