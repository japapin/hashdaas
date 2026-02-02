import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Urban Country Store - Sistema de Controle de Vendas",
  description: "Sistema de Business Intelligence para controle de vendas da Urban Country Store",
  keywords: ["Urban Country Store", "Dashboard", "Vendas", "BI", "Next.js", "TypeScript"],
  authors: [{ name: "Urban Country Store" }],
  icons: {
    icon: "/logo.jpg",
  },
  openGraph: {
    title: "Urban Country Store - Dashboard",
    description: "Sistema de BI para controle de vendas",
    url: "",
    siteName: "Urban Country Store",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-50`}
      >
        <ThemeProvider defaultTheme="dark">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
