import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { SplashScreen } from "@/shared/components/ui/SplashScreen";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VITALFIT — Nutrición & Entrenamiento",
  description:
    "VITALFIT: Plataforma de alto rendimiento para atletas y entrenadores",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} ${geistMono.variable} antialiased`}
      >
        <SplashScreen />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
