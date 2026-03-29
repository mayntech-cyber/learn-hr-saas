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

  // ✅ NOVO: Definiranje čvrstih klasa umjesto dinamičnih varijabli!
  const theme = isProfessional 
    ? {
        bg: "bg-orange-500",
        bgLight: "bg-orange-100",
        text: "text-orange-500",
        textLight: "text-orange-400",
        shadow: "shadow-orange-500/30"
      }
    : {
        bg: "bg-blue-500",
        bgLight: "bg-blue-100",
        text: "text-blue-500",
        textLight: "text-blue-400",
        shadow: "shadow-blue-500/30"
      };

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
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? theme.bgLight : 'bg-slate-100'}`}>
          <Trophy size={48} className={passed ? theme.text : 'text-slate-400'} />
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
          <button onClick={restart} className={`w-full ${theme.bg} text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg ${theme.shadow} hover:scale-105 transition-transform`}>
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
    <div
      className="max-w-2xl mx-auto animate-in fade-in"
      style={{ background: 'rgba(10,30,60,0.65)', borderRadius: 20, width: '100%' }}
    >
      {/* HEADER */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12, padding: '8px 12px', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <HelpCircle size={18} style={{ color: isProfessional ? '#f97316' : '#60a5fa' }} />
            {t("Kviz").main} ({tLevel.main} {activeLevel})
          </h2>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>{lesson.name}</p>
        </div>
        <div style={{ width: 42 }} />
      </div>

      {/* PROGRESS BAR */}
      <div style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {tQuestion.main} {currentIndex + 1} {tOf.main} {words.length}
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: isProfessional ? 'linear-gradient(90deg, #f97316, #ea580c)' : 'linear-gradient(90deg, #3b82f6, #2563eb)',
              borderRadius: 99,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>

      {/* QUESTION CARD */}
      <div style={{ margin: '0 24px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '32px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: isProfessional ? '#fb923c' : '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: 16 }}>
          {tHowToSay.main}
        </span>
        <h3 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 900, color: 'white', fontStyle: 'italic', lineHeight: 1.2 }}>
          "{currentWord?.word_hr}"
        </h3>
      </div>

      {/* OPTIONS */}
      <div style={{ margin: '0 24px', display: 'grid', gap: 10 }}>
        {shuffledOptions.map((option) => {
          const isSelected = selectedOption === option.id;
          const showCorrect = isAnswered && option.isCorrect;
          const showWrong = isSelected && isAnswered && !option.isCorrect;

          let optionStyle: React.CSSProperties = {
            width: '100%',
            padding: '16px 20px',
            borderRadius: 16,
            border: '2px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontWeight: 800,
            fontSize: '1rem',
            textAlign: 'left',
            cursor: isAnswered ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'border-color 0.15s, background 0.15s',
            backdropFilter: 'blur(4px)',
          };

          if (showCorrect) {
            optionStyle = { ...optionStyle, background: 'rgba(16,185,129,0.25)', border: '2px solid #10b981', color: '#6ee7b7' };
          } else if (showWrong) {
            optionStyle = { ...optionStyle, background: 'rgba(239,68,68,0.25)', border: '2px solid #ef4444', color: '#fca5a5' };
          }

          return (
            <button key={option.id} onClick={() => handleAnswer(option)} disabled={isAnswered} style={optionStyle}>
              <span>{option.text}</span>
              {showCorrect && <div style={{ background: '#10b981', color: 'white', borderRadius: '50%', padding: 4, display: 'flex' }}><Check size={14} /></div>}
              {showWrong && <div style={{ background: '#ef4444', color: 'white', borderRadius: '50%', padding: 4, display: 'flex' }}><X size={14} /></div>}
            </button>
          );
        })}
      </div>

      <div style={{ height: '24px' }} />

      {/* NEXT BUTTON */}
      {isAnswered && (
        <div style={{ padding: '16px 24px 24px' }}>
          <button
            onClick={nextQuestion}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 16,
              border: 'none',
              background: isProfessional ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              fontWeight: 900,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: isProfessional ? '0 4px 16px rgba(249,115,22,0.35)' : '0 4px 16px rgba(59,130,246,0.35)',
            }}
          >
            {currentIndex === words.length - 1 ? t("Završi kviz").main : t("Sljedeće pitanje").main}
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}