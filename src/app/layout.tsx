import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YAA — L'Afrique avance, vos ambitions prennent vie",
  description:
    "YAA est la plateforme e-commerce tout-en-un pour les marchands africains. Boutique en ligne, paiements Mobile Money, livraison, WhatsApp Business, IA. De la première vente à l'expansion internationale.",
  keywords: [
    "YAA",
    "e-commerce Afrique",
    "Mobile Money",
    "Wave",
    "Orange Money",
    "MTN Mobile Money",
    "WhatsApp Business",
    "boutique en ligne Afrique",
  ],
  authors: [{ name: "YAA" }],
  openGraph: {
    title: "YAA — L'Afrique avance, vos ambitions prennent vie",
    description:
      "La plateforme e-commerce tout-en-un pour les marchands africains. Boutique, paiements, livraison, WhatsApp, IA.",
    siteName: "YAA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YAA — L'Afrique avance, vos ambitions prennent vie",
    description:
      "La plateforme e-commerce tout-en-un pour les marchands africains.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
