"use client";

import { useState, useMemo } from "react";
import { Search, Globe2, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import FlipDictionaryCard from "./FlipDictionaryCard";
import { useLanguage } from "./LanguageContext";

const CATEGORY_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  "hrana":     { emoji: "🍎", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  "kuhinja":   { emoji: "🍳", color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  "odjeća":    { emoji: "👗", color: "text-pink-600",   bg: "bg-pink-50 border-pink-200" },
  "dom":       { emoji: "🏠", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
  "obitelj":   { emoji: "👨‍👩‍👧", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  "priroda":   { emoji: "🌿", color: "text-green-600",  bg: "bg-green-50 border-green-200" },
  "more":      { emoji: "🌊", color: "text-blue-600",   bg: "bg-blue-50 border-blue-200" },
  "tijelo":    { emoji: "💪", color: "text-red-600",    bg: "bg-red-50 border-red-200" },
  "zdravlje":  { emoji: "❤️", color: "text-rose-600",   bg: "bg-rose-50 border-rose-200" },
  "prijevoz":  { emoji: "✈️", color: "text-sky-600",    bg: "bg-sky-50 border-sky-200" },
  "grad":      { emoji: "🏙️", color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" },
  "alati":     { emoji: "🔨", color: "text-stone-600",  bg: "bg-stone-50 border-stone-200" },
  "životinje": { emoji: "🐾", color: "text-lime-600",   bg: "bg-lime-50 border-lime-200" },
  "osjećaji":  { emoji: "💙", color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
  "ostalo":    { emoji: "📦", color: "text-slate-600",  bg: "bg-slate-50 border-slate-200" },
};

export default function GeneralDictionaryClient({ words }: { words: any[] }) {
  const { euLang, nativeLang, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("sve");
  const [selectedCategory, setSelectedCategory] = useState("sve");

  const head = t("Cjelokupni rječnik");
  const back = t("Nazad");
  const shown = t("Prikazano");
  const inBase = t("riječi u bazi");
  const placeholder = t("Pretraži rječnik...");
  const noWords = t("Nema pronađenih riječi...");

  const availableCategories = useMemo(() => {
    const cats = new Set(words.map((w) => w.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [words]);

  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      const matchesType = selectedType === "sve" || w.word_type === selectedType;
      const matchesCategory = selectedCategory === "sve" || w.category === selectedCategory;
      const matchesSearch = w.hr_word?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [words, searchTerm, selectedType, selectedCategory]);

  if (!euLang || !nativeLang) return null;

  const typeButtons = [
    { key: "sve",     label: t("Sve").main,     emoji: "📚" },
    { key: "imenica", label: t("Imenice").main,  emoji: "🔤" },
    { key: "broj",    label: t("Brojevi").main,  emoji: "🔢" },
    { key: "glagol",  label: t("Glagoli").main,  emoji: "⚡" },
  ];

  return (
    <div className="w-full p-4 md:p-10 max-w-7xl mx-auto min-h-screen flex flex-col animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="mb-5">
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

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
              <Globe2 size={24} className="md:hidden" />
              <Globe2 size={28} className="hidden md:block" />
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
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
            <BookOpen size={14} className="text-orange-500" />
            <span className="text-orange-600 font-black px-2 py-0.5 bg-orange-50 rounded-lg border border-orange-100">
              {filteredWords.length}
            </span>
            <span className="text-xs">{inBase.main}</span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative mb-3">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={placeholder.main}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold focus:outline-none focus:border-blue-500 transition-all text-sm shadow-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* FILTER NIVO 1 — Tip */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        {typeButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => { setSelectedType(btn.key); setSelectedCategory("sve"); }}
            className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
              selectedType === btn.key
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-500"
            }`}
          >
            <span>{btn.emoji}</span>
            <span>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* FILTER NIVO 2 — Kategorije */}
      {(selectedType === "sve" || selectedType === "imenica") && availableCategories.length > 0 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("sve")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
              selectedCategory === "sve"
                ? "bg-slate-800 text-white border-slate-800 shadow-md"
                : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
            }`}
          >
            🗂️ Sve
          </button>

          {availableCategories.map((cat) => {
            const cfg = CATEGORY_CONFIG[cat] || { emoji: "📦", color: "text-slate-600", bg: "bg-slate-50 border-slate-200" };
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border capitalize ${
                  isActive
                    ? `${cfg.bg} ${cfg.color} shadow-sm`
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600"
                }`}
              >
                <span>{cfg.emoji}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* GRID */}
      {filteredWords.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-slate-400 font-bold text-lg">{noWords.main}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredWords.map((w) => {
            const trans = typeof w.translations === "string" ? JSON.parse(w.translations) : w.translations || {};
            return (
              <FlipDictionaryCard
                key={w.id}
                wordHr={w.hr_word}
                euTranslation={trans[euLang] || "—"}
                nativeTranslation={trans[nativeLang] || "—"}
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