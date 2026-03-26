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

export default function GeneralDictionaryClient({ words, categoryData = [] }: { words: any[], categoryData?: any[] }) {
  const { euLang, nativeLang, uiMode, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMainCat, setSelectedMainCat] = useState<string | null>(null);
  const [selectedSubCat, setSelectedSubCat] = useState("sve");

  const head = t("Cjelokupni rječnik");
  const back = t("Nazad");
  const shown = t("Prikazano");
  const inBase = t("riječi u bazi");
  const placeholder = t("Pretraži rječnik...");
  const noWords = t("Nema pronađenih riječi...");

  // Mapa slug → {id, emoji, label, translations, parent_id} iz baze
  const catDataMap = useMemo(() => {
    const map: Record<string, any> = {};
    categoryData.forEach(c => { map[c.slug] = c; });
    return map;
  }, [categoryData]);

  const mainCategories = useMemo(() =>
    categoryData.filter(c => !c.parent_id),
  [categoryData]);

  const subCategories = useMemo(() => {
    if (selectedMainCat === null) return [];
    const mainCat = catDataMap[selectedMainCat];
    if (!mainCat) return [];
    return categoryData.filter(c => c.parent_id === mainCat.id);
  }, [categoryData, catDataMap, selectedMainCat]);

  // Dohvati label kategorije na trenutnom jeziku
  const getCatLabel = (slug: string): string => {
    const cat = catDataMap[slug];
    if (!cat) return slug;
    const trans = cat.translations || {};
    if (uiMode === 'native' && trans[nativeLang]) return trans[nativeLang];
    if (uiMode === 'eu' && trans[euLang]) return trans[euLang];
    return cat.label || slug; // fallback na HR
  };

  const getCatEmoji = (slug: string): string => {
    const cat = catDataMap[slug];
    return cat?.emoji || CATEGORY_CONFIG[slug]?.emoji || "📦";
  };

  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      let matchesCategory = true;
      if (selectedSubCat !== "sve") {
        matchesCategory = w.category === selectedSubCat;
      } else if (selectedMainCat !== null) {
        if (subCategories.length > 0) {
          matchesCategory = subCategories.some((s: any) => s.slug === w.category);
        } else {
          matchesCategory = w.category === selectedMainCat;
        }
      }
      const matchesSearch = w.hr_word?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [words, searchTerm, selectedMainCat, selectedSubCat, subCategories]);

  if (!euLang || !nativeLang) return null;


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

      {/* FILTER NIVO 1 — Glavne kategorije (tabovi) */}
      {mainCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {mainCategories.map((cat: any) => {
            const isActive = selectedMainCat === cat.slug;
            const cfg = CATEGORY_CONFIG[cat.slug] || { emoji: "📦", color: "text-slate-600", bg: "bg-slate-50 border-slate-200" };
            return (
              <button
                key={cat.slug}
                onClick={() => { setSelectedMainCat(isActive ? null : cat.slug); setSelectedSubCat("sve"); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                  isActive
                    ? `${cfg.bg} ${cfg.color} shadow-sm`
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600"
                }`}
              >
                <span>{getCatEmoji(cat.slug)}</span>
                <span>{getCatLabel(cat.slug)}</span>
                {isActive && (
                  <span className="ml-0.5 opacity-60 hover:opacity-100">×</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* FILTER NIVO 2 — Podkategorije */}
      {selectedMainCat !== null && subCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5 pl-2 border-l-2 border-slate-200">
          {subCategories.map((cat: any) => {
            const isActive = selectedSubCat === cat.slug;
            const cfg = CATEGORY_CONFIG[cat.slug] || { emoji: "📦", color: "text-slate-600", bg: "bg-slate-50 border-slate-200" };
            return (
              <button
                key={cat.slug}
                onClick={() => setSelectedSubCat(isActive ? "sve" : cat.slug)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all border capitalize ${
                  isActive
                    ? `${cfg.bg} ${cfg.color} shadow-sm`
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600"
                }`}
              >
                <span>{getCatEmoji(cat.slug)}</span>
                <span>{getCatLabel(cat.slug)}</span>
                {isActive && (
                  <span className="ml-0.5 opacity-60 hover:opacity-100">×</span>
                )}
              </button>
            );
          })}
        </div>
      )}
      <div className="mb-5" />

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