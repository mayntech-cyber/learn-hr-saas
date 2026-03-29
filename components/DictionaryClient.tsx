"use client";

import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import DictionaryCard from "./DictionaryCard";
import FlipDictionaryCardJob from "./FlipDictionaryCardJob";
import { useLanguage } from "./LanguageContext";

// DODALI SMO 'job' U PROPS KAKO BI ZNALI NAZIV ZANIMANJA
export default function DictionaryClient({ words, job }: { words: any[], job?: any }) {
  // Iz 'mozga' vučemo i t funkciju i uiMode za dinamični naslov
  const { euLang, nativeLang, t, uiMode } = useLanguage();

  // 1. STATIČNI PRIJEVODI
  const back = t("Nazad na izbornik zanimanja");
  const dictTitle = t("Rječnik");

  // 2. DINAMIČNI NAZIV ZANIMANJA (Prebacuje se ovisno o jeziku)
  const getJobName = () => {
    if (!job) return "";
    if (uiMode === 'hr') return job.name_hr;
    
    const trans = job.translations || {};
    if (uiMode === 'native' && trans[nativeLang]) return trans[nativeLang];
    if (uiMode === 'eu' && trans[euLang]) return trans[euLang];
    
    return job.name_hr; // Osigurač ako nema prijevoda
  };

  const jobName = getJobName();

  return (
    // GLAVNI OMOTAČ (Sada je ovdje umjesto u page.tsx)
    <div className="w-full p-4 md:p-10 max-w-7xl mx-auto min-h-screen flex flex-col animate-in fade-in duration-500">
      
      {/* --- DVOJEZIČNI HEADER --- */}
      <div className="mb-8">
        <Link href={`/learn/${job?.id || ''}`} className="group inline-flex flex-col mb-6">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
            <ArrowLeft size={16} /> 
            <span>{back.main}</span>
          </div>
          {!back.isOnlyHr && (
            <span className="text-[10px] font-bold text-slate-300 ml-6 uppercase tracking-tighter italic">
              {back.sub}
            </span>
          )}
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-md">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-none flex items-center gap-2 flex-wrap">
              <span>{dictTitle.main}:</span> 
              <span className="text-blue-600">{jobName}</span>
            </h1>
            {!dictTitle.isOnlyHr && (
              <p className="text-[11px] font-black text-blue-400 uppercase mt-1 tracking-widest italic opacity-80">
                {dictTitle.sub}: {job?.name_hr}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- TVOJ ORIGINALNI GRID S RIJEČIMA --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
        {words.map((w) => {
          let parsedTranslations: any = {};
          if (typeof w.translations === 'string') {
            try { parsedTranslations = JSON.parse(w.translations); } catch (e) {}
          } else if (typeof w.translations === 'object' && w.translations !== null) {
            parsedTranslations = w.translations;
          }

          // Osiguranje da ne pukne ako Mozak kasni milisekundu
          const safeEu = euLang || "en";
          const safeNative = nativeLang || "ar";

          const euTrans = parsedTranslations[safeEu] || "Prijevod nedostaje";
          const nativeTrans = parsedTranslations[safeNative] || "Prijevod nedostaje";

          return (
            <FlipDictionaryCardJob
              key={w.id}
              wordId={w.id}
              wordHr={w.hr_word}
              euTranslation={euTrans}
              nativeTranslation={nativeTrans}
              imageUrl={w.image_url}
              audioUrl={w.audio_url}
              wordType={w.word_type}
            />
          );
        })}
      </div>
    </div>
  );
}