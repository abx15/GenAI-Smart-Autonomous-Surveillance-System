import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/AppProviders";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-space-grotesk" 
});
const jetbrains = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-jetbrains" 
});

export const metadata: Metadata = {
  title: "SASS | Tactical Intelligence",
  description: "Smart Autonomous Surveillance System - Real-time AI Tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrains.variable}`}>
      <body className="bg-[#070710] text-[#f0f0f5] antialiased selection:bg-[#9b5eff] selection:text-white">
        <Providers>
          <div className="min-h-screen flex flex-col relative">
            {/* Subtle grid background for military feel */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-[9999] grid-bg" />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
