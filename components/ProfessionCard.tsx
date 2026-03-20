"use client";

import Link from "next/link";
import { HardHat, ArrowRight, Volume2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

interface ProfessionCardProps {
  id: string;
  nameHr: string;
  translations: any;
  imageUrl?: string | null;
  audioUrl?: string | null;
  wordCount: number;
}

export default function ProfessionCard({ id, nameHr, translations, imageUrl, audioUrl, wordCount }: ProfessionCardProps) {
  // 1. Dodajemo 't' funkciju
  const { euLang, nativeLang, t } = useLanguage();

  const euTranslation = translations?.[euLang] || "";
  const nativeTranslation = translations?.[nativeLang] || "";

  // 2. Povlačimo prijevod za riječ "pojmova"
  const tPojmova = t("pojmova");

  const playAudio = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (audioUrl) {
      new Audio(audioUrl).play();
    } else {
      const utterance = new SpeechSynthesisUtterance(nameHr);
      utterance.lang = 'hr-HR';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Link 
      href={`/learn/${id}`} 
      className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-stretch group overflow-hidden h-full"
    >
      <div className="w-2/5 flex-shrink-0 bg-slate-50/50 text-slate-400 relative flex items-center justify-center border-r border-slate-50">
        {imageUrl ? (
          <img src={imageUrl} alt={nameHr} className="w-full h-full object-cover" />
        ) : (
          <HardHat size={32} className="opacity-40" />
        )}
        <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <div className="p-4 md:p-5 flex flex-col justify-center flex-1 relative min-h-[130px]">
        {/* NASLOV I ZVUČNIK */}
        <div className="flex justify-between items-start gap-2 pr-6">
          <h3 className="font-black text-base md:text-lg text-slate-800 leading-snug">
            {nameHr}
          </h3>
          <button 
            onClick={playAudio} 
            className="text-slate-300 hover:text-orange-500 transition-colors p-1"
            title="Poslušaj izgovor"
          >
            <Volume2 size={18} />
          </button>
        </div>
        
        <div className="flex flex-col mt-1 pr-6">
          {euLang !== 'hr' && euTranslation && (
            <span className="text-[13px] md:text-sm font-bold text-orange-500">{euTranslation}</span>
          )}
          {nativeTranslation && (
             <span className="text-[13px] md:text-sm font-bold text-orange-600/80">{nativeTranslation}</span>
          )}
        </div>

        {/* 3. Ubacujemo dinamički prijevod umjesto fiksne riječi */}
        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 mt-3 md:mt-4">
          {wordCount} {tPojmova.main}
        </p>

        <div className="absolute bottom-4 right-4 bg-slate-50 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
          <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}