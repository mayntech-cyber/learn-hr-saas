import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import LanguageSetupModal from "@/components/LanguageSetupModal";
// 1. OVDJE UVOZIMO MOZAK
import { LanguageProvider } from "@/components/LanguageContext"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LearnHR | Edukacija stranih radnika",
  description: "Platforma za učenje hrvatskog jezika za strane radnike i agencije.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr">
      <body className={inter.className}>
        {/* 2. MOZAK OMOTAVA APSOLUTNO SVE! */}
        <LanguageProvider>
          
          <LanguageSetupModal />
          
          <div className="flex min-h-screen bg-slate-50">
            <Navigation />
            <main className="flex-1 md:ml-64 pb-20 md:pb-0 flex justify-center">
              {children}
            </main>
          </div>

        </LanguageProvider>
      </body>
    </html>
  );
}