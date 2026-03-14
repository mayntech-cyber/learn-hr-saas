"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

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
  const [euLang, setEuLang] = useState("");
  const [nativeLang, setNativeLang] = useState("");
  const [euLangName, setEuLangName] = useState("");
  const [nativeLangName, setNativeLangName] = useState("");
  const [uiMode, setUiMode] = useState<'hr' | 'eu' | 'native'>('hr');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [uiTranslations, setUiTranslations] = useState<any[]>([]);

  useEffect(() => {
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
      setIsModalOpen(true);
    }

    const fetchUi = async () => {
      const { data } = await supabase.from('ui_translations').select('*');
      if (data) setUiTranslations(data);
    };
    fetchUi();
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

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