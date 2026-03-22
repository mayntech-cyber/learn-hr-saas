import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. OVDJE UVOZIMO MOZAK
import { LanguageProvider } from "@/components/LanguageContext"; 
import LanguageSetupModal from "@/components/LanguageSetupModal";

// 2. UVOZIMO NAŠ NOVI OMOTAČ KOJI SAKRIVA SIDEBAR
import LayoutWrapper from "@/components/LayoutWrapper";

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
        {/* MOZAK OMOTAVA APSOLUTNO SVE! */}
        <LanguageProvider>
          
          <LanguageSetupModal />
          
          {/* NOVO: Wrapper koji pametno skriva/prikazuje navigaciju ovisno o URL-u */}
          <LayoutWrapper>
            {children}
          </LayoutWrapper>

        </LanguageProvider>
      </body>
    </html>
  );
}