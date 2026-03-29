"use client";
import React, { useState, useEffect } from "react";
import { Check, X, ArrowRight, Trophy, RefreshCcw, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useLanguage } from "./LanguageContext";

export default function GapFillPlayer({
  lesson,
  words,
  onClose,
  activeLevel = 1,
}: {
  lesson: any;
  words: any[];
  onClose: () => void;
  activeLevel?: number;
}) {
  const supabase = createClient();
  const { t } = useLanguage();

  const tNemaRecjenica = t("Nema rečenica dostupnih za ovu lekciju.");
  const tNatrag = t("Natrag");
  const tBravo = t("Bravo!");
  const tViseSrece = t("Više sreće idući put");
  const tTocnost = t("Točnost:");
  const tZavrsi = t("Završi");
  const tPokusajPonovno = t("Pokušaj ponovno");

  const validWords = words.filter(w => {
    if (!w.context_sentence || w.context_sentence.trim() === "") return false;
    const escaped = w.word_hr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const replaced = w.context_sentence.replace(new RegExp(escaped, "gi"), "___");
    return replaced !== w.context_sentence;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<any[]>([]);
  const [earnedXp, setEarnedXp] = useState<number | null>(null);
  const [xpDiff, setXpDiff] = useState<number | null>(null);

  const getSentenceWithBlank = (word: any) => {
    if (!word.context_sentence) return "";
    const escaped = word.word_hr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return word.context_sentence.replace(new RegExp(escaped, "gi"), "___");
  };

  const renderSentence = (sentence: string) => {
    const parts = sentence.split("___");
    return parts.map((part, i) => (
      <React.Fragment key={i}>
        {part}
        {i < parts.length - 1 && (
          <span
            style={{
              borderBottom: "3px solid rgba(255,255,255,0.5)",
              paddingBottom: 2,
              color: "rgba(255,255,255,0.35)",
              minWidth: 64,
              display: "inline-block",
              textAlign: "center",
            }}
          >
            ___
          </span>
        )}
      </React.Fragment>
    ));
  };

  const generateOptions = (index: number) => {
    if (!validWords[index]) return;
    const correct = validWords[index];

    const distractors = validWords
      .filter(w => w.id !== correct.id)
      .map(w => w.word_hr)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    while (distractors.length < 3) {
      distractors.push("...");
    }

    const options = [
      { text: correct.word_hr, isCorrect: true, id: correct.id },
      ...distractors.map((text, i) => ({ text, isCorrect: false, id: `wrong-${i}` })),
    ].sort(() => Math.random() - 0.5);

    setShuffledOptions(options);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  useEffect(() => {
    if (validWords.length > 0) generateOptions(currentIndex);
  }, [currentIndex, validWords.length]);

  const handleAnswer = (option: any) => {
    if (isAnswered) return;
    setSelectedOption(option.id);
    setIsAnswered(true);
    if (option.isCorrect) setScore(s => s + 1);
  };

  const saveResult = async (finalScore: number, total: number) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return;

    const accuracy = (finalScore / total) * 100;
    const xpEarned = finalScore * 10;

    const { data: oldData } = await supabase
      .from("user_test_results")
      .select("xp_earned")
      .eq("user_id", user.id)
      .eq("category_id", lesson.id)
      .eq("game_type", `GAP_FILL_${activeLevel}`);

    const oldBest =
      oldData && oldData.length > 0
        ? Math.max(...oldData.map((r: any) => r.xp_earned || 0))
        : 0;

    setEarnedXp(xpEarned);
    setXpDiff(xpEarned - oldBest);

    await supabase.from("user_test_results").insert({
      user_id: user.id,
      category_id: lesson.id || null,
      game_type: `GAP_FILL_${activeLevel}`,
      score: finalScore,
      total_questions: total,
      accuracy_percentage: accuracy,
      xp_earned: xpEarned,
    });
  };

  const nextQuestion = () => {
    if (currentIndex < validWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      saveResult(score, validWords.length);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    generateOptions(0);
  };

  if (validWords.length === 0) {
    return (
      <div
        className="max-w-2xl mx-auto animate-in fade-in"
        style={{ background: "rgba(10,30,60,0.65)", borderRadius: 20, width: "100%", padding: "48px 24px", textAlign: "center" }}
      >
        <p style={{ color: "rgba(255,255,255,0.6)", fontWeight: 700, marginBottom: 24 }}>
          {tNemaRecjenica.main}
        </p>
        <button
          onClick={onClose}
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "10px 20px", color: "rgba(255,255,255,0.8)", cursor: "pointer", fontWeight: 800 }}
        >
          {tNatrag.main}
        </button>
      </div>
    );
  }

  if (isFinished) {
    const accuracy = (score / validWords.length) * 100;
    const passed = accuracy >= 80;

    return (
      <div className="max-w-md mx-auto p-8 text-center bg-white rounded-[3rem] shadow-xl border border-slate-100 animate-in zoom-in-95">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? "bg-yellow-100" : "bg-slate-100"}`}>
          <Trophy size={48} className={passed ? "text-yellow-500" : "text-slate-400"} />
        </div>

        <h2 className="text-4xl font-black text-slate-800 mb-2">
          {passed ? tBravo.main : tViseSrece.main}
        </h2>

        <p className="text-slate-500 font-bold mb-6 italic">
          {tTocnost.main} {Math.round(accuracy)}% ({score}/{validWords.length})
        </p>

        {xpDiff !== null && earnedXp !== null && (
          <div className="mb-8 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100">
            {xpDiff > 0 && earnedXp === xpDiff ? (
              <p className="text-emerald-600 font-black">
                Prvi put odigrano! 🎉<br />
                <span className="text-2xl">+{earnedXp} XP</span>
              </p>
            ) : xpDiff > 0 ? (
              <p className="text-emerald-600 font-black">
                Srušen rekord! 🏆<br />
                Dodatnih <span className="text-2xl">+{xpDiff} XP</span>
              </p>
            ) : (
              <p className="text-slate-500 font-bold">
                Tvoj stari rekord od <span className="text-slate-700">{earnedXp - xpDiff} XP</span> je i dalje nedostižan. Probaj opet! 💪
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={restart}
            className="w-full bg-yellow-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/30 hover:scale-105 transition-transform"
          >
            <RefreshCcw size={20} /> {tPokusajPonovno.main}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-colors"
          >
            {tZavrsi.main}
          </button>
        </div>
      </div>
    );
  }

  const currentWord = validWords[currentIndex];
  const progress = ((currentIndex + 1) / validWords.length) * 100;
  const sentence = getSentenceWithBlank(currentWord);

  return (
    <div
      className="max-w-2xl mx-auto animate-in fade-in"
      style={{ background: "rgba(10,30,60,0.65)", borderRadius: 20, width: "100%" }}
    >
      {/* HEADER */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={onClose}
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "8px 12px", color: "rgba(255,255,255,0.8)", cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "white", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
            ✏️ Rupa u rečenici (Razina {activeLevel})
          </h2>
          <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>
            {lesson.name}
          </p>
        </div>
        <div style={{ width: 42 }} />
      </div>

      {/* PROGRESS BAR */}
      <div style={{ padding: "16px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Rečenica {currentIndex + 1} od {validWords.length}
          </span>
          <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.15)", borderRadius: 99, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #eab308, #ca8a04)",
              borderRadius: 99,
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* SENTENCE CARD */}
      <div style={{ margin: "0 24px 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "32px 24px", textAlign: "center" }}>
        <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#fde047", textTransform: "uppercase", letterSpacing: "0.2em", display: "block", marginBottom: 16 }}>
          Popuni prazninu
        </span>
        <p style={{ fontSize: "clamp(1.1rem, 4vw, 1.5rem)", fontWeight: 800, color: "white", lineHeight: 1.6 }}>
          {renderSentence(sentence)}
        </p>
      </div>

      {/* OPTIONS */}
      <div style={{ margin: "0 24px", display: "grid", gap: 10 }}>
        {shuffledOptions.map((option) => {
          const isSelected = selectedOption === option.id;
          const showCorrect = isAnswered && option.isCorrect;
          const showWrong = isSelected && isAnswered && !option.isCorrect;

          let optionStyle: React.CSSProperties = {
            width: "100%",
            padding: "16px 20px",
            borderRadius: 16,
            border: "2px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.1)",
            color: "white",
            fontWeight: 800,
            fontSize: "1rem",
            textAlign: "left",
            cursor: isAnswered ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "border-color 0.15s, background 0.15s",
            backdropFilter: "blur(4px)",
          };

          if (showCorrect) {
            optionStyle = { ...optionStyle, background: "rgba(16,185,129,0.25)", border: "2px solid #10b981", color: "#6ee7b7" };
          } else if (showWrong) {
            optionStyle = { ...optionStyle, background: "rgba(239,68,68,0.25)", border: "2px solid #ef4444", color: "#fca5a5" };
          }

          return (
            <button key={option.id} onClick={() => handleAnswer(option)} disabled={isAnswered} style={optionStyle}>
              <span>{option.text}</span>
              {showCorrect && (
                <div style={{ background: "#10b981", color: "white", borderRadius: "50%", padding: 4, display: "flex" }}>
                  <Check size={14} />
                </div>
              )}
              {showWrong && (
                <div style={{ background: "#ef4444", color: "white", borderRadius: "50%", padding: 4, display: "flex" }}>
                  <X size={14} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ height: "24px" }} />

      {/* NEXT BUTTON */}
      {isAnswered && (
        <div style={{ padding: "16px 24px 24px" }}>
          <button
            onClick={nextQuestion}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, #eab308, #ca8a04)",
              color: "white",
              fontWeight: 900,
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 16px rgba(234,179,8,0.35)",
            }}
          >
            {currentIndex === validWords.length - 1 ? "Završi igru" : "Sljedeće"}
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
