"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, Globe2, ArrowLeft, SlidersHorizontal, X } from "lucide-react";
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftMainCat, setDraftMainCat] = useState<string | null>(null);
  const [draftSubCat, setDraftSubCat] = useState("sve");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 60;
  const defaultsApplied = useRef(false);

  // Batch fetch svih word_progress statusa - jedan request umjesto N
  useEffect(() => {
    const fetchProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const wordIds = words.map(w => w.id);
      if (wordIds.length === 0) return;
      const { data } = await supabase
        .from("word_progress")
        .select("word_id, status")
        .eq("user_id", user.id)
        .in("word_id", wordIds);
      if (!data) return;
      const map: Record<number, "known" | "unknown"> = {};
      data.forEach(p => {
        map[p.word_id] = p.status === "known" ? "known" : "unknown";
      });
      setProgressMap(map);
    };
    fetchProgress();
  }, [words]);
  const touchStartY = useRef(0);

  const head = t("Cjelokupni rječnik");
  const back = t("Nazad");
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

  const drawerSubCategories = useMemo(() => {
    if (draftMainCat === null) return [];
    const mainCat = catDataMap[draftMainCat];
    if (!mainCat) return [];
    return categoryData.filter(c => c.parent_id === mainCat.id);
  }, [categoryData, catDataMap, draftMainCat]);

  // Default pri prvom učitavanju: kategorija roditelja od 'abeceda' + podkategorija 'abeceda'
  useEffect(() => {
    if (defaultsApplied.current || categoryData.length === 0) return;
    const abecedaCat = categoryData.find((c: any) => c.slug === "abeceda");
    if (abecedaCat) {
      const parentCat = categoryData.find((c: any) => c.id === abecedaCat.parent_id);
      if (parentCat) setSelectedMainCat(parentCat.slug);
      setSelectedSubCat("abeceda");
    }
    defaultsApplied.current = true;
  }, [categoryData]);

  const getCatLabel = (slug: string): string => {
    const cat = catDataMap[slug];
    if (!cat) return slug;
    const trans = cat.translations || {};
    if (uiMode === "native" && trans[nativeLang]) return trans[nativeLang];
    if (uiMode === "eu" && trans[euLang]) return trans[euLang];
    return cat.label || slug;
  };

  const getCatEmoji = (slug: string): string => {
    const cat = catDataMap[slug];
    return cat?.emoji || CATEGORY_CONFIG[slug]?.emoji || "📦";
  };

  const filteredWords = useMemo(() => {
    setCurrentPage(1);
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

  const totalPages = Math.ceil(filteredWords.length / PAGE_SIZE);
  const paginatedWords = filteredWords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openDrawer = () => {
    setDraftMainCat(selectedMainCat);
    setDraftSubCat(selectedSubCat);
    setDrawerOpen(true);
  };

  const applyFilter = () => {
    setSelectedMainCat(draftMainCat);
    setSelectedSubCat(draftSubCat);
    setDrawerOpen(false);
  };

  const resetDraft = () => {
    setDraftMainCat(null);
    setDraftSubCat("sve");
  };

  const clearActiveFilter = () => {
    setSelectedMainCat(null);
    setSelectedSubCat("sve");
  };

  // Preview u filter baru: do 2 aktivne labele
  const isFilterActive = selectedMainCat !== null;
  const previewParts: string[] = [];
  if (selectedMainCat) previewParts.push(`${getCatEmoji(selectedMainCat)} ${getCatLabel(selectedMainCat)}`);
  if (selectedSubCat !== "sve") previewParts.push(`${getCatEmoji(selectedSubCat)} ${getCatLabel(selectedSubCat)}`);

  // Badge label
  const badgeLabel = [
    selectedMainCat ? getCatLabel(selectedMainCat) : null,
    selectedSubCat !== "sve" ? getCatLabel(selectedSubCat) : null,
  ].filter(Boolean).join(" · ");

  if (!euLang || !nativeLang) return null;

  return (
    <>
      {/* DRAWER BACKDROP */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* DRAWER */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${drawerOpen ? "translate-y-0" : "translate-y-full"}`}
        onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
        onTouchEnd={(e) => { if (e.changedTouches[0].clientY - touchStartY.current > 80) setDrawerOpen(false); }}
      >
        <div className="bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-shrink-0">
            <span className="text-sm font-black text-slate-800">⚙️ Filtriraj</span>
            <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <X size={18} className="text-slate-400" />
            </button>
          </div>
          {/* Sadržaj */}
          <div className="overflow-y-auto px-5 py-4 space-y-5 flex-1">
            {/* Kategorija */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Kategorija</p>
              <div className="flex flex-wrap gap-2">
                {mainCategories.map((cat: any) => {
                  const isActive = draftMainCat === cat.slug;
                  const cfg = CATEGORY_CONFIG[cat.slug] || { color: "text-slate-600", bg: "bg-slate-50 border-slate-200" };
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => { setDraftMainCat(isActive ? null : cat.slug); setDraftSubCat("sve"); }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                        isActive
                          ? `${cfg.bg} ${cfg.color} shadow-sm`
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span>{getCatEmoji(cat.slug)}</span>
                      <span>{getCatLabel(cat.slug)}</span>
                      {isActive && <span className="opacity-60">×</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Podkategorija */}
            {draftMainCat !== null && drawerSubCategories.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Podkategorija</p>
                <div className="flex flex-wrap gap-2">
                  {drawerSubCategories.map((cat: any) => {
                    const isActive = draftSubCat === cat.slug;
                    const cfg = CATEGORY_CONFIG[cat.slug] || { color: "text-slate-600", bg: "bg-slate-50 border-slate-200" };
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => setDraftSubCat(isActive ? "sve" : cat.slug)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all border capitalize ${
                          isActive
                            ? `${cfg.bg} ${cfg.color} shadow-sm`
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span>{getCatEmoji(cat.slug)}</span>
                        <span>{getCatLabel(cat.slug)}</span>
                        {isActive && <span className="opacity-60">×</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="flex gap-3 px-5 py-4 border-t border-slate-100 flex-shrink-0">
            <button
              onClick={resetDraft}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Resetiraj
            </button>
            <button
              onClick={applyFilter}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-black shadow-md hover:bg-blue-700 transition-colors"
            >
              Primijeni
            </button>
          </div>
        </div>
      </div>

      {/* STRANICA */}
      <div className="w-full p-4 md:p-10 max-w-7xl mx-auto min-h-screen flex flex-col animate-in fade-in duration-500">

        {/* HEADER */}
        <div className="mb-5" style={{ background: 'rgba(10,30,60,0.65)', borderRadius: 16, padding: '1.5rem', color: 'white' }}>
          <Link href="/general" className="group inline-flex flex-col mb-4">
            <div className="flex items-center gap-2 text-sm font-bold transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <ArrowLeft size={16} />
              <span>{back.main}</span>
            </div>
            {!back.isOnlyHr && (
              <span className="text-[10px] font-bold ml-6 uppercase tracking-tighter italic" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
                <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-none" style={{ color: 'white' }}>
                  {head.main}
                </h1>
                {!head.isOnlyHr && (
                  <p className="text-[11px] font-black uppercase mt-1 tracking-widest italic opacity-80" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {head.sub}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }} />
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

        {/* FILTER BAR */}
        <div className="mb-3" style={{ background: 'rgba(10,30,60,0.65)', borderRadius: 16, padding: '1rem' }}>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <button
              onClick={openDrawer}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                isFilterActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Filtriraj</span>
            </button>
            {previewParts.slice(0, 2).map((p, i) => (
              <span key={i} className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
                {p}
              </span>
            ))}
            {previewParts.length > 2 && (
              <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>...</span>
            )}
          </div>

          {/* AKTIVNI FILTER BADGE */}
          {isFilterActive && (
            <div className="flex items-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                🚩 {badgeLabel}
                <button
                  onClick={clearActiveFilter}
                  className="ml-0.5 hover:text-blue-900 transition-colors"
                  aria-label="Resetiraj filter"
                >
                  ✕
                </button>
              </span>
            </div>
          )}
        </div>

        <div className="mb-3" />

        {/* GRID */}
        {filteredWords.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-400 font-bold text-lg">{noWords.main}</p>
          </div>
        ) : (
          <>
            {/* Broj rezultata */}
            <p className="text-xs font-bold text-slate-400 mb-3">
              {filteredWords.length} {filteredWords.length === 1 ? "riječ" : "riječi"}
              {totalPages > 1 && ` · stranica ${currentPage} / ${totalPages}`}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {paginatedWords.map((w) => {
                const trans = typeof w.translations === "string" ? JSON.parse(w.translations) : w.translations || {};
                return (
                  <FlipDictionaryCard
                    key={w.id}
                    wordId={w.id}
                    wordHr={w.hr_word}
                    euTranslation={trans[euLang] || "—"}
                    nativeTranslation={trans[nativeLang] || "—"}
                    imageUrl={w.image_url}
                    audioUrl={w.audio_url}
                    wordType={w.word_type}
                    category={w.category}
                    initialStatus={progressMap[w.id] || "none"}
                    userId={userId || undefined}
                  />
                );
              })}
            </div>

            {/* PAGINACIJA */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← Prethodna
                </button>
                <span className="text-sm font-black text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Sljedeća →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}