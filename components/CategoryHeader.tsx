"use client";

import { HardHat, Volume2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

interface CategoryHeaderProps {
  category: any;
}

export default function CategoryHeader({ category }: CategoryHeaderProps) {
  const { euLang, nativeLang, t } = useLanguage();

  if (!category) return null;

  // Prijevodi za samo ime kategorije (Sektora)
  const euTranslation = category.translations?.[euLang] || "";
  const nativeTranslation = category.translations?.[nativeLang] || "";

  // 1. POPRAVAK: Tražimo hrvatski tekst, a ne "choose_profession"
  const subtitle = t("Odaberi zanimanje");

  const playAudio = () => {
    if (category.audio_url) {
      new Audio(category.audio_url).play();
    } else {
      const utterance = new SpeechSynthesisUtterance(category.name_hr);
      utterance.lang = 'hr-HR';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 mb-8">
      
      {/* 2. IKONA ILI SLIKA SEKTORA */}
      {category.image_url ? (
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-md flex-shrink-0 border-2 border-white ring-1 ring-slate-100">
           <img src={category.image_url} alt={category.name_hr} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="bg-slate-800 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-2xl text-white shadow-md flex-shrink-0">
          <HardHat size={40} />
        </div>
      )}
      
      <div className="flex flex-col justify-center">
        
        {/* 3. NAZIV SEKTORA I ZVUČNIK */}
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-4xl font-black leading-tight" style={{ color: 'white' }}>
            {category.name_hr}
          </h1>
          <button 
            onClick={playAudio} 
            className="p-2 bg-blue-50 text-blue-500 rounded-full hover:bg-blue-100 transition-colors shadow-sm"
          >
            <Volume2 size={22} />
          </button>
        </div>
        
        {/* 4. PRIJEVODI IMENA SEKTORA */}
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {euLang !== 'hr' && euTranslation && (
            <span className="text-base sm:text-lg font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>{euTranslation}</span>
          )}
          {nativeTranslation && (
            <>
              {euLang !== 'hr' && euTranslation && <span className="text-slate-300">/</span>}
              <span className="text-base sm:text-lg font-bold text-blue-300">{nativeTranslation}</span>
            </>
          )}
        </div>

        {/* 5. DVOJEZIČNI PODNASLOV (Popravljeno) */}
        <div className="mt-4">
          <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {subtitle.main}
          </p>
          {!subtitle.isOnlyHr && (
            <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
               <span>{subtitle.sub}</span>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}