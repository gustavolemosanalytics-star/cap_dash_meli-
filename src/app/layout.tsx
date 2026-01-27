import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Meli Music - Dashboard",
  description: "Dashboard moderno para acompanhamento de campanhas de marketing digital. Visualize métricas, funil de conversão e performance dos criativos.",
  keywords: ["dashboard", "marketing", "campanhas", "ads", "métricas", "ROAS", "CTR", "Meli Music"],
  icons: {
    icon: '/logo-somos.png',
    shortcut: '/logo-somos.png',
    apple: '/logo-somos.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
