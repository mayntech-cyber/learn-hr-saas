"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client"; 
import { Gamepad2, Loader2, Trophy, ArrowRight, BookOpen, Layers, Link2, ArrowLeft, Globe, HardHat, CheckCircle2, Lock } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import FlashcardPlayer from "./FlashcardPlayer"; 
import MatchGamePlayer from "./MatchGamePlayer";
import QuizPlayer from "./QuizPlayer";

export default function TestsClient({ userId, userPlan, bgImage }: { userId?: string, userPlan?: string, bgImage?: string | null }) {
  const supabase = createClient();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "professional">("general");
  const [activeGame, setActiveGame] = useState<"NONE" | "FLASHCARDS" | "MATCH" | "QUIZ">("NONE");
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [lessonWords, setLessonWords] = useState<any[]>([]);
  const [loadingWords, setLoadingWords] = useState(false);
  const { t } = useLanguage();
  

  // LOGIKA ZA LEVELE I BODOVE
  const [userResults, setUserResults] = useState<any[]>([]);
  const [totalXP, setTotalXP] = useState(0);

  const [showRankPopup, setShowRankPopup] = useState(false);

  // MODAL ZA ODABIR LEVELA
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [availableLevels, setAvailableLevels] = useState<number[]>([]);
  const [allLessonWords, setAllLessonWords] = useState<any[]>([]);
  const [activeLevel, setActiveLevel] = useState(1);

  // PRIJEVODI
  const tTitle = t("Testovi i Vježbe");
  const tSubTitle = t("Provjeri svoje znanje kroz interaktivne igre i kvizove.");
  const tRank = t("Tvoj Rang");
  const tBeginner = t("Početnik");
  const tLoading = t("Učitavam lekcije...");
  const tUnlock = t("Završi lekciju da otključaš nove riječi.");
  const tCards = t("Kartice");
  const tMatch = t("Spoji");
  const tMainQuiz = t("Glavni Kviz");
  const tGeneral = t("Opći jezik");
  const tProfessional = t("Stručni jezik");
  
  // NOVI PRIJEVODI
  const tChooseLevel = t("Odaberi razinu težine za ovaj kviz.");
  const tLevel = t("Razina");
  const tCancel = t("Odustani");
  const tPassedLevel = t("Položen Lvl");
  const tNewQuiz = t("Novi kviz");
  const tNoTests = t("Nema dostupnih testova u ovoj kategoriji.");
  const tLoadingCards = t("Učitavam kartice...");
  const tBackToTests = t("Nazad na Testove");
  const tPreparingGame = t("Pripremam igru...");
  // PRIJEVODI ZA NOVI DIZAJN KARTICA
  const tOpci = t("Opći");
  const tStrucni = t("Stručni");
  const tPolozhen = t("Položen");
  const tNovo = t("Novo");
  const tProgress = t("Napredak");
  const tMatchPairs = t("Spoji parove");
  const tGapFill = t("Rupa u rečenici");
  const tNadogradi = t("Nadogradi");


  // Dohvaćanje lekcija
  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("edu_lessons")
        .select("*")
        .eq("category", activeTab)
        .order("created_at", { ascending: false });
        
      if (data) setLessons(data);
      setLoading(false);
    };
    fetchLessons();
  }, [activeTab]);

  // Pametno računanje High Scorea i kvačica (Anti-farming)
  useEffect(() => {
    const fetchResults = async () => {
      if (!userId) {
        console.warn("userId je prazan, čekam...");
        return;
      }

      const { data, error } = await supabase
        .from("user_test_results")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Greška baze:", error.message);
        return;
      }

      if (data) {
        setUserResults(data);
        const xpMap = new Map();
        data.forEach(row => {
          const key = `${row.category_id}_${row.game_type}`;
          const currentBest = xpMap.get(key) || 0;
          if ((row.xp_earned || 0) > currentBest) {
            xpMap.set(key, row.xp_earned);
          }
        });

        let sum = 0;
        xpMap.forEach(value => sum += value);
        setTotalXP(sum);
      }
    };

    fetchResults();
  }, [userId, activeGame === "NONE"]);

  const getHighestLevelPassed = (lessonId: string) => {
    const passedQuizzes = userResults.filter(r => 
      r.category_id === lessonId && 
      r.game_type?.startsWith("ABC_QUIZ_") && 
      r.accuracy_percentage >= 80
    );

    if (passedQuizzes.length === 0) return 0;
    const levels = passedQuizzes.map(r => parseInt(r.game_type.split("_")[2]) || 1);
    return Math.max(...levels);
  };

  const isLevelPassed = (lessonId: string, level: number) => {
    return userResults.some(r => 
      r.category_id === lessonId && 
      r.game_type === `ABC_QUIZ_${level}` && 
      r.accuracy_percentage >= 80
    );
  };

  const openQuizMenu = async (lesson: any) => {
    setLoadingWords(true);
    const { data, error } = await supabase
      .from("edu_vocabulary")
      .select("id, hr_word, translations, difficulty_level") 
      .eq("lesson_id", lesson.id);

    if (error) console.error(error);

    const words = data || [];
    const levels = Array.from(new Set(words.map(w => w.difficulty_level || 1))).sort();
    
    const formattedWords = words.map((w: any) => ({
      id: w.id,
      word_hr: w.hr_word, 
      translations: w.translations,
      level: w.difficulty_level || 1
    }));

    setAllLessonWords(formattedWords);
    setAvailableLevels(levels);
    setSelectedLesson(lesson);
    setShowLevelModal(true);
    setLoadingWords(false);
  };

  const startQuizLevel = (level: number) => {
    const filteredWords = allLessonWords.filter(w => w.level === level);
    setLessonWords(filteredWords);
    setActiveLevel(level);
    setShowLevelModal(false);
    setActiveGame("QUIZ");
  };

  const openFlashcards = async (lesson: any) => {
    setLoadingWords(true);
    setSelectedLesson(lesson);
    setActiveGame("FLASHCARDS");
    
    const { data, error } = await supabase
      .from("edu_vocabulary")
      .select("id, hr_word, translations") 
      .eq("lesson_id", lesson.id)
      .eq("difficulty_level", 1)
      .order("difficulty_level", { ascending: true });

    if (error) console.error("Greška pri povlačenju riječi:", error);
      
    const formattedWords = (data || []).map((w: any) => ({
      id: w.id,
      word_hr: w.hr_word,
      translations: w.translations,
      image_url: "", 
      audio_url: ""  
    }));

    setLessonWords(formattedWords);
    setLoadingWords(false);
  };

  const openMatchGame = async (lesson: any) => {
    setLoadingWords(true);
    setSelectedLesson(lesson);
    setActiveGame("MATCH");
    
    const { data, error } = await supabase
      .from("edu_vocabulary")
      .select("id, hr_word, translations")
      .eq("lesson_id", lesson.id)
      .eq("difficulty_level", 1)
      .order("difficulty_level", { ascending: true });

    if (error) console.error("Greška pri povlačenju riječi:", error);
      
    const formattedWords = (data || []).map((w: any) => ({
      id: w.id,
      word_hr: w.hr_word,
      translations: w.translations
    }));

    setLessonWords(formattedWords);
    setLoadingWords(false);
  };

  // --- RENDER LOGIKA ZA IGRE ---
  if (activeGame === "FLASHCARDS" && selectedLesson) {
    if (loadingWords) return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 size={40} className="animate-spin mb-4 text-orange-500" />
        <p className="font-bold">{tLoadingCards.main}</p>
      </div>
    );
    return (
      <div className="min-h-screen">
        <FlashcardPlayer
          words={lessonWords} 
          job={{ id: selectedLesson.id, name_hr: selectedLesson.name }}
          isGeneral={true} 
        />
      </div>
    );
  }

  if (activeGame === "MATCH" && selectedLesson) {
    if (loadingWords) return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 size={40} className="animate-spin mb-4 text-emerald-500" />
        <p className="font-bold">{tPreparingGame.main}</p>
      </div>
    );
    return (
      <div
        className="min-h-screen pt-4 md:pt-10"
        style={bgImage ? {
          backgroundImage: `linear-gradient(rgba(255,255,255,0.65), rgba(255,255,255,0.65)), url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingBottom: '2rem',
        } : { background: '#f8fafc', paddingBottom: '2rem' }}
      >
        <MatchGamePlayer lesson={selectedLesson} words={lessonWords} onClose={() => setActiveGame("NONE")} />
      </div>
    );
  }

  if (activeGame === "QUIZ" && selectedLesson) {
    if (loadingWords) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    return (
      <div className="min-h-screen pt-10" style={{ paddingBottom: '2rem' }}>
        <QuizPlayer 
          lesson={selectedLesson} 
          words={lessonWords} 
          onClose={() => setActiveGame("NONE")}
          isProfessional={activeTab === "professional"}
          userId={userId} 
          activeLevel={activeLevel} 
        />
      </div>
    );
  }

  // --- GLAVNI UI ---
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-10 pt-10 relative animate-in fade-in slide-in-from-bottom-4 duration-500" style={bgImage ? {
      backgroundImage: `linear-gradient(rgba(255,255,255,0.65), rgba(255,255,255,0.65)), url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh'
    } : { minHeight: '100vh' }}>
      
      {/* MODAL ZA ODABIR LEVELA */}
      {showLevelModal && selectedLesson && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 px-4">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-800 mb-2">{selectedLesson.name}</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">{tChooseLevel.main}</p>
            
            <div className="space-y-3 mb-6">
              {availableLevels.map((lvl) => {
                const isUnlocked = lvl === 1 || isLevelPassed(selectedLesson.id, lvl - 1);
                const hasPassedThis = isLevelPassed(selectedLesson.id, lvl);

                return (
                  <button 
                    key={lvl}
                    disabled={!isUnlocked}
                    onClick={() => startQuizLevel(lvl)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 font-bold transition-all ${
                      isUnlocked 
                        ? hasPassedThis 
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" 
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-500 shadow-sm" 
                        : "border-slate-100 bg-slate-50 text-slate-400 opacity-70 cursor-not-allowed" 
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {tLevel.main} {lvl}
                      {!isUnlocked && <Lock size={16} className="text-slate-400" />}
                    </span>
                    {hasPassedThis && <CheckCircle2 size={20} className="text-emerald-500" />}
                  </button>
                );
              })}
            </div>
            
            <button onClick={() => setShowLevelModal(false)} className="w-full py-4 font-bold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-2xl transition-colors">
              {tCancel.main}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-4xl font-black text-slate-800 flex items-center gap-3 whitespace-nowrap">
            <Gamepad2 className="text-blue-600" size={32} />
            {tTitle.main}
          </h1>
          <p className="hidden md:block text-slate-500 font-medium mt-3 text-sm md:text-base">{tSubTitle.main}</p>
        </div>

        {/* Desktop badge */}
        <div className="hidden md:flex bg-amber-50 border border-amber-200 px-5 py-3 rounded-2xl items-center gap-4 shadow-sm flex-shrink-0">
          <div className="bg-amber-500 p-2 rounded-full text-white"><Trophy size={20} /></div>
          <div>
            <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{tRank.main}</div>
            <div className="font-black text-slate-800">{tBeginner.main} ({totalXP} XP)</div>
          </div>
        </div>

        {/* Mobile compact button + dropdown */}
        <div className="relative md:hidden flex-shrink-0">
          <button
            onClick={() => setShowRankPopup(v => !v)}
            className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-xl shadow-sm"
          >
            <Trophy size={14} className="text-amber-500" />
            <span className="text-xs font-black text-slate-800">{totalXP} XP</span>
          </button>
          {showRankPopup && (
            <div className="absolute right-0 top-full mt-3 whitespace-nowrap z-10" style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.2))' }}>
              {/* Trokutić */}
              <div className="absolute right-3 -top-1.5 w-0 h-0" style={{ borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '8px solid #1D9E75' }} />
              <div style={{ background: 'linear-gradient(135deg, #1D9E75, #0f6e56)', borderRadius: 14, padding: '10px 16px' }}>
                <div className="flex items-center gap-2">
                  <span className="text-base">🏆</span>
                  <div>
                    <div style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{tBeginner.main}</div>
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 600 }}>{totalXP} XP</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-[1.8rem] mb-10 w-full max-w-md mx-auto shadow-inner border border-slate-200/50">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 md:py-3.5 rounded-[1.5rem] font-black text-sm md:text-base transition-all ${
            activeTab === "general"
            ? "bg-white text-blue-600 shadow-lg scale-100 border border-blue-50"
            : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Globe size={14} className="md:hidden" /><Globe size={18} className="hidden md:block" /> {tGeneral.main}
        </button>
        <button
          onClick={() => setActiveTab("professional")}
          className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 md:py-3.5 rounded-[1.5rem] font-black text-sm md:text-base transition-all ${
            activeTab === "professional"
            ? "bg-white text-orange-600 shadow-lg scale-100 border border-orange-50"
            : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <HardHat size={14} className="md:hidden" /><HardHat size={18} className="hidden md:block" /> {tProfessional.main}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
          <p className="font-bold">{tLoading.main}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => {
            const highestLevel = getHighestLevelPassed(lesson.id);
            const hasStarted = highestLevel > 0;
            const isGeneralTab = activeTab === "general";
            const isProfessionalLocked = activeTab === "professional" && userPlan === "ind_free";

            const hasFlashcards = userResults.some(r => r.category_id === lesson.id && (r.game_type === "FLASHCARDS" || r.game_type === "FLASHCARD"));
            const hasMatch = userResults.some(r => r.category_id === lesson.id && (r.game_type === "MATCH" || r.game_type === "MATCH_GAME"));
            const completedCount = [hasFlashcards, hasMatch, hasStarted].filter(Boolean).length;

            const headerGradient = isGeneralTab
              ? "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)"
              : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)";

            return (
              <div key={lesson.id} className="relative bg-white rounded-[1.75rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-lg transition-shadow duration-300">

                {/* HEADER */}
                <div className="relative flex-shrink-0" style={{ height: 180, background: lesson.image_url ? undefined : headerGradient }}>
                  {lesson.image_url && (
                    <img src={lesson.image_url} alt={lesson.name} className="absolute inset-0 w-full h-full object-cover object-top" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/35" />

                  {/* Badge: OPĆI / STRUČNI */}
                  <div className="absolute top-3 left-3">
                    <span
                      className="text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{ background: isGeneralTab ? '#1D9E75' : '#f97316' }}
                    >
                      {isGeneralTab ? tOpci.main : tStrucni.main}
                    </span>
                  </div>

                  {/* Status: ⭐ Položen / Novo */}
                  <div className="absolute top-3 right-3">
                    {hasStarted ? (
                      <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                        ⭐ {tPolozhen.main}
                      </span>
                    ) : (
                      <span className="bg-white/20 text-white/80 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {tNovo.main}
                      </span>
                    )}
                  </div>

                  {/* Naziv lekcije */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-black text-[15px] leading-tight drop-shadow-sm">{lesson.name}</h3>
                  </div>
                </div>

                {/* BODY — igrice */}
                <div className="flex flex-col divide-y divide-slate-50 flex-1">

                  {/* Kartice */}
                  <button
                    onClick={() => openFlashcards(lesson)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-emerald-50 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-base">🃏</span>
                      <span className="font-bold text-slate-700 text-sm group-hover:text-emerald-700 transition-colors">{tCards.main}</span>
                    </div>
                    <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">+20 XP</span>
                  </button>

                  {/* Spoji parove */}
                  <button
                    onClick={() => openMatchGame(lesson)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-base">🔗</span>
                      <span className="font-bold text-slate-700 text-sm group-hover:text-blue-700 transition-colors">{tMatchPairs.main}</span>
                    </div>
                    <span className="text-[11px] font-black text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">+30 XP</span>
                  </button>

                  {/* Rupa u rečenici — nije implementirano */}
                  <div className="flex items-center justify-between px-4 py-3 opacity-40 cursor-not-allowed select-none">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-base">✏️</span>
                      <span className="font-bold text-slate-700 text-sm">{tGapFill.main}</span>
                    </div>
                    <span className="text-[11px] font-black text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">+40 XP</span>
                  </div>

                  {/* Glavni kviz */}
                  <button
                    onClick={() => openQuizMenu(lesson)}
                    className="flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-slate-700 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-base">🎯</span>
                      <span className="font-bold text-white text-sm">{tMainQuiz.main}</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">+100 XP</span>
                  </button>
                </div>

                {/* PROGRESS BAR */}
                <div className="px-4 py-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      {tProgress.main} {completedCount}/4
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${(completedCount / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {/* PRO LOCK OVERLAY */}
                {isProfessionalLocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.75rem]" style={{ backdropFilter: 'blur(6px)', background: 'rgba(255,255,255,0.75)' }}>
                    <span className="text-4xl mb-2">🔒</span>
                    <span className="font-black text-slate-800 text-sm mb-3">Pro plan</span>
                    <a
                      href="/pricing"
                      className="text-white text-sm font-black px-5 py-2.5 rounded-xl transition-colors"
                      style={{ background: '#f97316' }}
                    >
                      {tNadogradi.main} →
                    </a>
                  </div>
                )}
              </div>
            );
          })}

          {lessons.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">{tNoTests.main}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}