"use client";

import { useState, useMemo } from "react";
import { Search, Globe2, ArrowLeft, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import FlipDictionaryCard from "./FlipDictionaryCard";
import { useLanguage } from "./LanguageContext";

export default function GeneralDictionaryClient({ words }: { words: any[] }) {
  const { euLang, nativeLang, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("Sve");

  const head = t("Cjelokupni rječnik");
  const back = t("Nazad");
  const shown = t("Prikazano");
  const inBase = t("riječi u bazi");
  const placeholder = t("Pretraži rječnik...");
  const noWords = t("Nema pronađenih riječi...");

  const types = useMemo(() => {
    const allTypes = new Set(words.map((w) => w.word_type || "Ostalo"));
    return ["Sve", ...Array.from(allTypes).sort()];
  }, [words]);

  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      const matchesType =
        selectedType === "Sve" || (w.word_type || "Ostalo") === selectedType;
      const matchesSearch = w.hr_word
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [words, searchTerm, selectedType]);

  if (!euLang || !nativeLang) return null;

  return (
    <div className="w-full p-4 md:p-10 max-w-7xl mx-auto min-h-screen flex flex-col animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="mb-6">
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
            <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-sm font-medium">
              <span>{shown.main}:</span>
              <span className="text-orange-600 font-black px-2 py-0.5 bg-orange-50 rounded-lg border border-orange-100">
                {filteredWords.length}
              </span>
              <span>{inBase.main}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH I FILTERI */}
      <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm mb-6 space-y-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder={placeholder.main}
            className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:outline-none focus:border-blue-500 transition-all text-sm md:text-base"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {types.map((t_type) => {
            const translatedType = t(t_type);
            return (
              <button
                key={t_type}
                onClick={() => setSelectedType(t_type)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-black whitespace-nowrap transition-all ${
                  selectedType === t_type
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {translatedType.main}
              </button>
            );
          })}
        </div>
      </div>

      {/* STATS BAR */}
      <div className="flex items-center gap-4 mb-6 px-1">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <BookOpen size={14} />
          <span className="font-bold">{filteredWords.length} riječi</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Layers size={14} />
          <span className="font-bold">Tap karticu za prijevod</span>
        </div>
      </div>

      {/* FLIP CARD GRID */}
      {filteredWords.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-slate-400 font-bold text-lg">{noWords.main}</p>
          {!noWords.isOnlyHr && (
            <p className="text-[10px] text-slate-300 uppercase font-black mt-1 tracking-widest">
              {noWords.sub}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredWords.map((w) => {
            const trans =
              typeof w.translations === "string"
                ? JSON.parse(w.translations)
                : w.translations || {};

            const euTrans = trans[euLang] || "—";
            const nativeTrans = trans[nativeLang] || "—";

            return (
              <FlipDictionaryCard
                key={w.id}
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
      )}
    </div>
  );
}