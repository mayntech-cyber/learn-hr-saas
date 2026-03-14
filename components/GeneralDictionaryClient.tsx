"use client";

import { useState, useMemo } from "react";
import { Search, Globe2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import GeneralRow from "./GeneralRow";
import { useLanguage } from "./LanguageContext";

export default function GeneralDictionaryClient({ words }: { words: any[] }) {
  const { euLang, nativeLang, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("Sve");

  // 1. PRIJEVODI ZA HEADER (Naslov i navigacija)
  const head = t("Cjelokupni rječnik");
  const back = t("Nazad");
  const shown = t("Prikazano");
  const inBase = t("riječi u bazi");

  // 2. PRIJEVODI ZA SEARCH I TABLICU
  const placeholder = t("Pretraži rječnik...");
  const typeLabel = t("Tip");
  const hrLabel = t("Hrvatski");
  const euLabel = t("Pomoćni (EU)");
  const nativeLabel = t("Materinji");
  const listenLabel = t("Slušaj");
  const noWords = t("Nema pronađenih riječi...");
  const allLabel = t("Sve");

  const types = useMemo(() => {
    const allTypes = new Set(words.map(w => w.word_type || "Ostalo"));
    return ["Sve", ...Array.from(allTypes).sort()];
  }, [words]);

  const filteredWords = useMemo(() => {
    return words.filter(w => {
      const matchesType = selectedType === "Sve" || (w.word_type || "Ostalo") === selectedType;
      const matchesSearch = w.hr_word?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [words, searchTerm, selectedType]);

  if (!euLang || !nativeLang) return null;

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto min-h-screen flex flex-col animate-in fade-in duration-500">
      
      {/* --- HEADER SEKCIJA (Preseljeno iz page.tsx) --- */}
      <div className="mb-8">
        <Link href="/general" className="group inline-flex flex-col mb-4">
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
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
            <Globe2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-none">
              {head.main}
            </h1>
            {!head.isOnlyHr && (
              <p className="text-[11px] font-black text-blue-400 uppercase mt-1 tracking-widest italic opacity-80">
                {head.sub}
              </p>
            )}
            
            <div className="flex items-center gap-1.5 mt-3 text-slate-500 text-sm font-medium">
               <span>{shown.main}:</span>
               <span className="text-orange-600 font-black px-2 py-0.5 bg-orange-50 rounded-lg border border-orange-100">
                 {words?.length || 0}
               </span>
               <span>{inBase.main}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- SEARCH I FILTERI --- */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder={placeholder.main}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:outline-none focus:border-blue-500 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {types.map(t_type => {
              const translatedType = t(t_type);
              return (
                <button
                  key={t_type}
                  onClick={() => setSelectedType(t_type)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    selectedType === t_type ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {translatedType.main}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- TABLICA RIJEČI --- */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* ZAGLAVLJE TABLICE (Uvijek vidljivo i dvojezično) */}
          <div className="flex bg-slate-50 px-4 py-4 border-b border-slate-200 text-slate-400">
            <div className="w-16 md:w-24 flex flex-col">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{typeLabel.main}</span>
              {!typeLabel.isOnlyHr && <span className="text-[8px] font-bold opacity-60 uppercase">{typeLabel.sub}</span>}
            </div>
            <div className="flex-1 flex flex-col">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{hrLabel.main}</span>
              {!hrLabel.isOnlyHr && <span className="text-[8px] font-bold opacity-60 uppercase">{hrLabel.sub}</span>}
            </div>
            <div className="flex-1 flex flex-col">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{euLabel.main}</span>
              {!euLabel.isOnlyHr && <span className="text-[8px] font-bold opacity-60 uppercase">{euLabel.sub}</span>}
            </div>
            <div className="flex-1 flex flex-col">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{nativeLabel.main}</span>
              {!nativeLabel.isOnlyHr && <span className="text-[8px] font-bold opacity-60 uppercase">{nativeLabel.sub}</span>}
            </div>
            <div className="w-10 text-center flex flex-col items-center">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{listenLabel.main}</span>
              {!listenLabel.isOnlyHr && <span className="text-[8px] font-bold opacity-60 uppercase">{listenLabel.sub}</span>}
            </div>
          </div>

          {/* LISTA REDOVA */}
          <div className="divide-y divide-slate-100">
            {filteredWords.map((w) => {
              const trans = typeof w.translations === 'string' ? JSON.parse(w.translations) : w.translations;
              return (
                <GeneralRow 
                  key={w.id}
                  wordHr={w.hr_word}
                  euTranslation={trans[euLang] || "—"}
                  nativeTranslation={trans[nativeLang] || "—"}
                  type={w.word_type || "Riječ"}
                  audioUrl={w.audio_url}
                />
              );
            })}
          </div>
          
          {filteredWords.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
              <span className="text-slate-400 font-bold">{noWords.main}</span>
              {!noWords.isOnlyHr && <span className="text-[10px] text-slate-300 uppercase font-black mt-1 tracking-widest">{noWords.sub}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}