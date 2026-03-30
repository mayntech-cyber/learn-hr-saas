"use client";

import { useLanguage } from "./LanguageContext";
import { Puzzle, ArrowLeft, Volume2 } from "lucide-react";
import Link from "next/link";

export default function GrammarClient({ lessons }: { lessons: any[] }) {
  const { uiMode, nativeLang, euLang, t } = useLanguage();

  // 1. Grupiranje lekcija po kategoriji
  const groupedLessons = lessons.reduce((acc: any, lesson: any) => {
    if (!acc[lesson.category]) acc[lesson.category] = [];
    acc[lesson.category].push(lesson);
    return acc;
  }, {});

  // 2. Funkcija za dohvat prijevoda
  const getTranslation = (translations: any) => {
    if (uiMode === 'hr') return null;
    const currentLangCode = uiMode === 'native' ? nativeLang : euLang;
    return translations?.[currentLangCode] || null;
  };

  // 3. Funkcija za čitanje teksta (Browser TTS)
  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hr-HR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Vaš preglednik ne podržava čitanje teksta.");
    }
  };

  // Dinamični naslovi
  const tTitle = t("Gramatika - Šalabahteri");
  const tSubtitle = t("Brzi pregled osnovnih pravila i riječi.");
  const tBack = t("Natrag");

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto min-h-screen animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="mb-8 md:mb-12" style={{ background: 'rgba(10,30,60,0.65)', borderRadius: 16, padding: '1.5rem', color: 'white' }}>
        <Link href="/general" className="inline-flex items-center gap-2 font-bold mb-6 transition-colors px-4 py-2 rounded-full" style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
          <ArrowLeft size={18} /> {tBack.main}
        </Link>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="bg-purple-600 p-4 rounded-[1.5rem] text-white shadow-lg">
            <Puzzle size={32} />
          </div>
          <div className="text-center md:text-start">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none" style={{ color: 'white' }}>
              {tTitle.main}
            </h1>
            {/* MALI HRVATSKI NASLOV */}
            {!tTitle.isOnlyHr && (
              <p className="text-xs md:text-sm font-black uppercase mt-1 tracking-widest italic opacity-80" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {tTitle.sub}
              </p>
            )}

            <div className="font-medium mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <p>{tSubtitle.main}</p>
              {/* MALI HRVATSKI PODNASLOV */}
              {!tSubtitle.isOnlyHr && (
                <p className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {tSubtitle.sub}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MREŽA ŠALABAHTERA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {Object.keys(groupedLessons).map((category, index) => {
          const translatedCategory = t(category);

          return (
            <div key={index} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
              
              {/* Naslov kategorije - ispisujemo prijevod + HRVATSKI ORIGINAL */}
              <div className="bg-purple-50 p-5 border-b border-purple-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-black shrink-0">
                  {index + 1}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-black text-purple-900 uppercase tracking-tight leading-none mt-1">
                    {translatedCategory.main}
                  </h2>
                  {!translatedCategory.isOnlyHr && (
                    <p className="text-[10px] font-bold text-purple-500 uppercase tracking-tighter italic mt-1">
                      {translatedCategory.sub}
                    </p>
                  )}
                </div>
              </div>

              {/* Lista riječi (Tablica) */}
              <div className="flex-1 p-5 bg-slate-50/50">
                <div className="space-y-3">
                  {groupedLessons[category].map((lesson: any) => {
                    const translation = getTranslation(lesson.translations);
                    
                    return (
                      <div key={lesson.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <div>
                          <p className="font-black text-slate-800 text-lg">{lesson.hr_text}</p>
                          {translation && (
                            <p className="text-sm font-bold text-purple-600 mt-0.5">{translation}</p>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => playAudio(lesson.hr_text)}
                          className="text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors p-3 bg-slate-50 rounded-xl shadow-sm border border-slate-100 active:scale-95 shrink-0"
                          title="Poslušaj izgovor"
                        >
                          <Volume2 size={20} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}