"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client"; 
import { Gamepad2, Loader2, Trophy, ArrowRight, BookOpen, Layers, Link2, ArrowLeft, Globe, HardHat, CheckCircle2, Lock } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import FlashcardPlayer from "./FlashcardPlayer"; 
import MatchGamePlayer from "./MatchGamePlayer";
import QuizPlayer from "./QuizPlayer";

export default function TestsClient({ userId }: { userId?: string }) {
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

  // MODAL ZA ODABIR LEVELA
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [availableLevels, setAvailableLevels] = useState<number[]>([]);
  const [allLessonWords, setAllLessonWords] = useState<any[]>([]);
  const [activeLevel, setActiveLevel] = useState(1);

  // Prijevodi
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
  // Pametno računanje High Scorea i kvačica (Anti-farming)
  useEffect(() => {
    const fetchResults = async () => {
      // 1. Provjera ID-a (ne radimo ništa dok ga nemamo)
      if (!userId) {
        console.warn("userId je prazan, čekam...");
        return;
      }

      console.log("Provjera ID-a na domeni:", userId);

      // 2. Dohvaćanje rezultata iz baze
      const { data, error } = await supabase
        .from("user_test_results")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Greška baze:", error.message);
        return;
      }

      if (data) {
        console.log("✅ Bodovi uspješno dohvaćeni:", data.length, "redova");
        setUserResults(data);
        
        // Anti-Farming Logika: Uzmi samo najbolji XP
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
    // Osvježavamo samo kad se userId promijeni ili kad se ugasi igra (activeGame postane NONE)
  }, [userId, activeGame === "NONE"]);

  // NOVO: Tražimo koji je najveći level radnik prošao za ovu lekciju
  const getHighestLevelPassed = (lessonId: string) => {
    const passedQuizzes = userResults.filter(r => 
      r.category_id === lessonId && 
      r.game_type?.startsWith("ABC_QUIZ_") && 
      r.accuracy_percentage >= 80
    );

    if (passedQuizzes.length === 0) return 0;

    // Izvlačimo brojeve iz imena (npr. iz "ABC_QUIZ_2" izvlači broj 2)
    const levels = passedQuizzes.map(r => parseInt(r.game_type.split("_")[2]) || 1);
    return Math.max(...levels);
  };
  // Pomoćna funkcija za modal: Provjerava je li specifičan level položen
  const isLevelPassed = (lessonId: string, level: number) => {
    return userResults.some(r => 
      r.category_id === lessonId && 
      r.game_type === `ABC_QUIZ_${level}` && 
      r.accuracy_percentage >= 80
    );
  };

  // KAD RADNIK KLIKNE "KVIZ" -> OTVARAMO MODAL
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

  // KAD U MODALU ODABERE LEVEL -> POKREĆEMO KVIZ
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
    
    // Za vježbu vuče samo Level 1
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
    
    // Spajanje zasad vuče Level 1
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
        <p className="font-bold">Učitavam kartice...</p>
      </div>
    );
    return (
      <div className="min-h-screen bg-slate-50 pt-4 md:pt-10">
        <div className="max-w-4xl mx-auto px-4 md:px-10 mb-[-2rem] relative z-10">
           <button onClick={() => setActiveGame("NONE")} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-orange-500 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
             <ArrowLeft size={16} /> Nazad na Testove
           </button>
        </div>
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
        <p className="font-bold">Pripremam igru...</p>
      </div>
    );
    return (
      <div className="min-h-screen bg-slate-50 pt-4 md:pt-10">
        <MatchGamePlayer lesson={selectedLesson} words={lessonWords} onClose={() => setActiveGame("NONE")} />
      </div>
    );
  }

  if (activeGame === "QUIZ" && selectedLesson) {
    if (loadingWords) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    return (
      <div className="min-h-screen bg-slate-50 pt-10">
        <QuizPlayer 
          lesson={selectedLesson} 
          words={lessonWords} 
          onClose={() => setActiveGame("NONE")}
          isProfessional={activeTab === "professional"}
          userId={userId} 
          activeLevel={activeLevel} // <--- PROSLEDJUJEMO ODABRANI LEVEL U KVIZ
        />
      </div>
    );
  }

  // --- GLAVNI UI ---
  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pt-10 md:pt-12 relative">
      
      {/* NOVO: MODAL ZA ODABIR LEVELA */}
      {showLevelModal && selectedLesson && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 px-4">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-slate-800 mb-2">{selectedLesson.name}</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">Odaberi razinu težine za ovaj kviz.</p>
            
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
                      Razina {lvl}
                      {!isUnlocked && <Lock size={16} className="text-slate-400" />}
                    </span>
                    {hasPassedThis && <CheckCircle2 size={20} className="text-emerald-500" />}
                  </button>
                );
              })}
            </div>
            
            <button onClick={() => setShowLevelModal(false)} className="w-full py-4 font-bold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-2xl transition-colors">
              Odustani
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 flex items-center gap-3">
            <Gamepad2 className="text-blue-600" size={32} /> 
            {tTitle.main}
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-sm md:text-base">{tSubTitle.main}</p>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm w-full md:w-auto">
          <div className="bg-amber-500 p-2 rounded-full text-white"><Trophy size={20} /></div>
          <div>
            <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{tRank.main}</div>
            <div className="font-black text-slate-800">{tBeginner.main} ({totalXP} XP)</div>
          </div>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-[1.8rem] mb-10 w-full max-w-md mx-auto shadow-inner border border-slate-200/50">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[1.5rem] font-black transition-all ${
            activeTab === "general" 
            ? "bg-white text-blue-600 shadow-lg scale-100 border border-blue-50" 
            : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Globe size={18} /> {tGeneral.main}
        </button>
        <button
          onClick={() => setActiveTab("professional")}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[1.5rem] font-black transition-all ${
            activeTab === "professional" 
            ? "bg-white text-orange-600 shadow-lg scale-100 border border-orange-50" 
            : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <HardHat size={18} /> {tProfessional.main}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
          <p className="font-bold">{tLoading.main}</p>
        </div>
      ) : (
        // OVDJE JE FALIO OVAJ DIV KOJI PRAVI GRID (MREŽU)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => {
            const highestLevel = getHighestLevelPassed(lesson.id);
            const hasStarted = highestLevel > 0;

            return (
              <div key={lesson.id} 
                   className={`group relative bg-white rounded-[2rem] p-6 border-2 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col ${
                     hasStarted 
                       ? 'border-emerald-500/50' 
                       : activeTab === 'professional' ? 'border-orange-50/50' : 'border-blue-50/50'
                   }`}
              >
                
                {/* --- POČETAK GORNJEG DIJELA (SLIKA ILI IKONA) --- */}
                {lesson.image_url ? ( 
                  
                  // AKO IMA SLIKU:
                  <div className="relative w-full h-32 mb-4 rounded-xl overflow-hidden shadow-sm">
                    <img 
                      src={lesson.image_url} 
                      alt={lesson.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2">
                      <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md backdrop-blur-md ${
                        hasStarted 
                          ? 'bg-emerald-500/90 text-white border border-emerald-400' 
                          : 'bg-white/90 text-slate-700 border border-slate-100'
                      }`}>
                        {hasStarted ? <>🌟 Položen Lvl {highestLevel}</> : <>Novi kviz</>}
                      </div>
                    </div>
                  </div>

                ) : (
                  
                  // AKO NEMA SLIKU: Prikazuje staru ikonu (Knjigu)
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
                      hasStarted 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : activeTab === 'professional' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <BookOpen size={24} />
                    </div>
                    
                    <div className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all ${
                      hasStarted 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      {hasStarted ? <>🌟 Položen Lvl {highestLevel}</> : <>Novi kviz</>}
                    </div>
                  </div>

                )}
                {/* --- KRAJ GORNJEG DIJELA --- */}
                
                <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">{lesson.name}</h3>
                <p className="text-sm text-slate-500 font-medium mb-6 flex-1">{tUnlock.main}</p>
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button 
                    onClick={() => openFlashcards(lesson)}
                    className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 text-slate-600 rounded-xl font-bold transition-colors border border-slate-100"
                  >
                    <Layers size={20} /> <span className="text-xs">{tCards.main} (L1)</span>
                  </button>
                  <button 
                    onClick={() => openMatchGame(lesson)}
                    className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 rounded-xl font-bold transition-colors border border-slate-100"
                  >
                    <Link2 size={20} /> <span className="text-xs">{tMatch.main} (L1)</span>
                  </button>
                </div>

                <button 
                  onClick={() => openQuizMenu(lesson)} 
                  className={`w-full mt-3 text-white py-3.5 rounded-xl font-black flex items-center justify-center gap-2 shadow-md transition-all ${
                    hasStarted 
                      ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' 
                      : activeTab === 'professional' 
                        ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                  }`}
                >
                  {tMainQuiz.main} <ArrowRight size={18} /> 
                </button>
              </div>
            );
          })}
          
          {lessons.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
               <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">Nema dostupnih testova u ovoj kategoriji.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}