"use client";
import React, { useState, useEffect } from "react";
import { Check, X, ArrowRight, Trophy, RefreshCcw, ArrowLeft, HelpCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client"; 
import { useLanguage } from "./LanguageContext";

interface Word {
  id: string;
  word_hr: string;
  translations: any;
}

export default function QuizPlayer({ 
  lesson, 
  words, 
  onClose, 
  isProfessional, 
  userId,
  activeLevel = 1 
}: { 
  lesson: any, 
  words: Word[], 
  onClose: () => void, 
  isProfessional?: boolean,
  userId?: string,
  activeLevel?: number 
}) {
  const { euLang, nativeLang, t } = useLanguage();
  const supabase = createClient();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<any[]>([]);
  const [earnedXp, setEarnedXp] = useState<number | null>(null);
  const [xpDiff, setXpDiff] = useState<number | null>(null);

  const themeColor = isProfessional ? "orange" : "blue";

  // PRIJEVODI
  const tAuthError = t("Greška: Nisi ulogiran ili je istekla sesija.");
  const tBetterLuck = t("Više sreće idući put");
  const tAccuracy = t("Točnost:");
  const tFirstTime = t("Prvi put odigrano!");
  const tRecordBroken = t("Srušen rekord!");
  const tAdditional = t("Dodatnih");
  const tOldRecord1 = t("Tvoj stari rekord od");
  const tOldRecord2 = t("je i dalje nedostižan. Probaj opet!");
  const tLevel = t("Razina");
  const tQuestion = t("Pitanje");
  const tOf = t("od");
  const tHowToSay = t("Kako se kaže:");

  const getTranslation = (word: Word) => {
    let parsed = typeof word.translations === 'string' ? JSON.parse(word.translations || '{}') : (word.translations || {});
    return parsed[nativeLang] || parsed[euLang] || "—";
  };

  const generateQuestion = (index: number) => {
    if (!words[index]) return;
    
    const correctWord = words[index];
    const correctAnswer = getTranslation(correctWord);
    
    let distractors = words
      .filter(w => w.id !== correctWord.id)
      .map(w => getTranslation(w))
      .filter(tr => tr !== correctAnswer && tr !== "—");
    
    while (distractors.length < 3) {
      distractors.push("..."); 
    }

    const options = [
      { text: correctAnswer, isCorrect: true, id: correctWord.id },
      ...distractors.slice(0, 3).map((text, i) => ({ text, isCorrect: false, id: `wrong-${i}` }))
    ].sort(() => Math.random() - 0.5);

    setShuffledOptions(options);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  useEffect(() => {
    if (words.length > 0) generateQuestion(currentIndex);
  }, [currentIndex, words]);

  const handleAnswer = (option: any) => {
    if (isAnswered) return;
    setSelectedOption(option.id);
    setIsAnswered(true);
    if (option.isCorrect) setScore(s => s + 1);
  };

  const saveQuizResult = async (finalScore: number, total: number) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      alert(tAuthError.main);
      return;
    }

    const accuracy = (finalScore / total) * 100;
    const xpEarned = finalScore * 10;
    const gameType = `ABC_QUIZ_${activeLevel}`;

    const { data: oldData } = await supabase
      .from('user_test_results')
      .select('xp_earned')
      .eq('user_id', user.id)
      .eq('category_id', lesson.id)
      .eq('game_type', gameType);

    const oldBest = oldData && oldData.length > 0
      ? Math.max(...oldData.map(r => r.xp_earned || 0))
      : 0;

    const diff = xpEarned - oldBest;
    
    setEarnedXp(xpEarned);
    setXpDiff(diff);

    const { error } = await supabase
      .from('user_test_results')
      .insert({
        user_id: user.id, 
        category_id: lesson.id || null,
        game_type: gameType,
        score: finalScore,
        total_questions: total,
        accuracy_percentage: accuracy,
        xp_earned: xpEarned
      });

    if (error) {
      console.error("Baza je odbila spremiti:", error.message);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      saveQuizResult(score, words.length); 
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    generateQuestion(0);
  };

  if (isFinished) {
    const accuracy = (score / words.length) * 100;
    const passed = accuracy >= 80;

    return (
      <div className="max-w-md mx-auto p-8 text-center bg-white rounded-[3rem] shadow-xl border border-slate-100 animate-in zoom-in-95">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? `bg-${themeColor}-100` : 'bg-slate-100'}`}>
          <Trophy size={48} className={passed ? `text-${themeColor}-500` : 'text-slate-400'} />
        </div>
        
        <h2 className="text-4xl font-black text-slate-800 mb-2">
          {passed ? t("Bravo!").main : tBetterLuck.main}
        </h2>
        
        <p className="text-slate-500 font-bold mb-6 italic">
          {tAccuracy.main} {Math.round(accuracy)}% ({score}/{words.length})
        </p>

        {/* PAMETNA PORUKA ZA BODOVE */}
        {xpDiff !== null && earnedXp !== null && (
          <div className="mb-8 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100">
            {xpDiff > 0 && earnedXp === xpDiff ? (
              <p className="text-emerald-600 font-black">{tFirstTime.main} 🎉 <br/><span className="text-2xl">+{earnedXp} XP</span></p>
            ) : xpDiff > 0 ? (
              <p className="text-emerald-600 font-black">{tRecordBroken.main} 🏆 <br/>{tAdditional.main} <span className="text-2xl">+{xpDiff} XP</span></p>
            ) : (
              <p className="text-slate-500 font-bold">{tOldRecord1.main} <span className="text-slate-700">{earnedXp - xpDiff} XP</span> {tOldRecord2.main} 💪</p>
            )}
          </div>
        )}
        
        <div className="space-y-3">
          <button onClick={restart} className={`w-full bg-${themeColor}-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-${themeColor}-500/30 hover:scale-105 transition-transform`}>
            <RefreshCcw size={20} /> {t("Pokušaj ponovno").main}
          </button>
          <button onClick={onClose} className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-colors">
            {t("Završi").main}
          </button>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-in fade-in">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onClose} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
           <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
             <HelpCircle className={`text-${themeColor}-500`} /> {t("Kviz").main} ({tLevel.main} {activeLevel})
           </h2>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lesson.name}</p>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-2">
          <span>{tQuestion.main} {currentIndex + 1} {tOf.main} {words.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full bg-${themeColor}-500 transition-all duration-500`} style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-50 text-center mb-8">
        <span className={`text-[10px] font-black text-${themeColor}-400 uppercase tracking-[0.2em] mb-4 block`}>{tHowToSay.main}</span>
        <h3 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-2 italic">
          "{currentWord?.word_hr}"
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {shuffledOptions.map((option) => {
          const isSelected = selectedOption === option.id;
          const showCorrect = isAnswered && option.isCorrect;
          const showWrong = isSelected && isAnswered && !option.isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => handleAnswer(option)}
              disabled={isAnswered}
              className={`p-5 rounded-2xl border-2 font-black text-lg transition-all flex items-center justify-between
                ${showCorrect ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-500/10" : 
                  showWrong ? "bg-red-50 border-red-500 text-red-700 animate-shake" : 
                  isSelected ? "border-slate-800 bg-slate-800 text-white" : 
                  "bg-white border-slate-100 text-slate-600 hover:border-slate-300 shadow-sm active:scale-95"}
              `}
            >
              <span>{option.text}</span>
              {showCorrect && <div className="bg-emerald-500 text-white p-1 rounded-full"><Check size={16} /></div>}
              {showWrong && <div className="bg-red-500 text-white p-1 rounded-full"><X size={16} /></div>}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <button 
          onClick={nextQuestion}
          className={`w-full mt-8 bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all`}
        >
          {currentIndex === words.length - 1 ? t("Završi kviz").main : t("Sljedeće pitanje").main} 
          <ArrowRight size={20} />
        </button>
      )}
    </div>
  );
}