"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client"; 

type LanguageContextType = {
  euLang: string;
  nativeLang: string;
  euLangName: string;
  nativeLangName: string;
  uiMode: 'hr' | 'eu' | 'native';
  isModalOpen: boolean;
  setLanguages: (euCode: string, euName: string, nativeCode: string, nativeName: string, uiMode: 'hr' | 'eu' | 'native') => void;
  openModal: () => void;
  closeModal: () => void;
  t: (text: string) => { main: string; sub: string; isOnlyHr: boolean };
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();

  // ZADANE VRIJEDNOSTI (Sigurne za server)
  const [euLang, setEuLang] = useState("");
  const [nativeLang, setNativeLang] = useState("");
  const [euLangName, setEuLangName] = useState("");
  const [nativeLangName, setNativeLangName] = useState("");
  const [uiMode, setUiMode] = useState<'hr' | 'eu' | 'native'>('hr'); // Zadano je Hrvatski
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal je zadano zatvoren
  
  // UKLONILI SMO 'mounted' STATE JER NAM VIŠE NE TREBA!
  const [uiTranslations, setUiTranslations] = useState<any[]>([]);

  useEffect(() => {
    // 1. Čitanje iz LocalStorage-a (Ovo se događa samo u browseru)
    const savedEu = localStorage.getItem("LEARNHR_EU_CODE");
    const savedNative = localStorage.getItem("LEARNHR_NATIVE_CODE");
    const savedUiMode = localStorage.getItem("LEARNHR_UI_MODE") as 'hr' | 'eu' | 'native';

    if (savedEu && savedNative) {
      setEuLang(savedEu);
      setEuLangName(localStorage.getItem("LEARNHR_EU_NAME") || "EU");
      setNativeLang(savedNative);
      setNativeLangName(localStorage.getItem("LEARNHR_NATIVE_NAME") || "Materinji");
      setUiMode(savedUiMode || 'hr');
    } else {
      // Ako nema spremljenog jezika, tek SADA otvaramo modal
      setIsModalOpen(true);
    }

    // 2. Povlačenje prijevoda iz baze
    const fetchUi = async () => {
      const { data } = await supabase.from('ui_translations').select('*');
      if (data) setUiTranslations(data);
    };
    fetchUi();
  }, [supabase]); // <-- dodali smo supabase u dependency array da React bude sretan

  const t = (text: string) => {
    const item = uiTranslations.find(x => x.hr_text === text);
    let mainText = text;
    if (uiMode === 'eu') mainText = item?.translations?.[euLang] || text;
    if (uiMode === 'native') mainText = item?.translations?.[nativeLang] || text;

    return {
      main: mainText,
      sub: text,
      isOnlyHr: uiMode === 'hr' || mainText === text
    };
  };

  const setLanguages = (euCode: string, euName: string, nativeCode: string, nativeName: string, mode: 'hr' | 'eu' | 'native') => {
    localStorage.setItem("LEARNHR_EU_CODE", euCode);
    localStorage.setItem("LEARNHR_EU_NAME", euName);
    localStorage.setItem("LEARNHR_NATIVE_CODE", nativeCode);
    localStorage.setItem("LEARNHR_NATIVE_NAME", nativeName);
    localStorage.setItem("LEARNHR_UI_MODE", mode);
    
    setEuLang(euCode);
    setEuLangName(euName);
    setNativeLang(nativeCode);
    setNativeLangName(nativeName);
    setUiMode(mode);
    setIsModalOpen(false);
  };

  // ❌ OBRISANO: if (!mounted) return null;
  // ✅ SADA ODMAH VRAĆAMO CHILDREN! Aplikacija se odmah prikazuje!
  
  return (
    <LanguageContext.Provider value={{
      euLang, nativeLang, euLangName, nativeLangName, uiMode,
      isModalOpen, setLanguages, t,
      openModal: () => setIsModalOpen(true),
      closeModal: () => setIsModalOpen(false)
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};