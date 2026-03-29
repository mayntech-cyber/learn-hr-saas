"use client";

import { useState, useEffect } from "react";
import { Volume2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { createClient } from "@/utils/supabase/client";

interface FlipDictionaryCardProps {
  wordHr: string;
  euTranslation: string;
  nativeTranslation: string;
  imageUrl?: string;
  audioUrl?: string;
  wordType?: string;
  category?: string;
  wordId: number;
}

export default function FlipDictionaryCard({
  wordHr,
  euTranslation,
  nativeTranslation,
  imageUrl,
  audioUrl,
  wordType,
  category,
  wordId,
}: FlipDictionaryCardProps) {
  const { t } = useLanguage();
  const supabase = createClient();
  const [isFlipped, setIsFlipped] = useState(false);
  const [status, setStatus] = useState<"none" | "known" | "unknown">("none");

  // Učitaj postojeći status iz baze
  useEffect(() => {
    const loadStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('word_progress')
        .select('status')
        .eq('user_id', user.id)
        .eq('word_id', wordId)
        .single();
      if (data?.status === 'known') setStatus('known');
      else if (data?.status === 'learning') setStatus('unknown');
    };
    loadStatus();
  }, [wordId]);

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioUrl) {
      new Audio(audioUrl).play();
    } else {
      const utterance = new SpeechSynthesisUtterance(wordHr);
      utterance.lang = "hr-HR";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleKnown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus("known");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('word_progress').upsert({
      user_id: user.id,
      word_id: wordId,
      status: 'known',
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,word_id' });
  };

  const handleUnknown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus("unknown");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('word_progress').upsert({
      user_id: user.id,
      word_id: wordId,
      status: 'learning',
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,word_id' });
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus("none");
    setIsFlipped(false);
  };

  const borderColor =
    status === "known"
      ? "2px solid #34d399"
      : status === "unknown"
      ? "2px solid #f87171"
      : "2px solid #f1f5f9";

  return (
    <>
      <style>{`
        .flip-card { perspective: 1000px; height: 220px; cursor: pointer; position: relative; }
@media (min-width: 768px) { .flip-card { height: 300px; } }
        .flip-card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.5s; transform-style: preserve-3d; }
        .flip-card.flipped .flip-card-inner { transform: rotateY(180deg); }
        .flip-card-front, .flip-card-back { 
          position: absolute; 
          inset: 0; 
          backface-visibility: hidden; 
          -webkit-backface-visibility: hidden; 
          border-radius: 1.5rem; 
          overflow: hidden; 
          display: flex; 
          flex-direction: column; 
          background: white; 
        }
        .flip-card-back { transform: rotateY(180deg); }
      `}</style>

      <div
        className={`flip-card${isFlipped ? " flipped" : ""}`}
        style={{ border: borderColor, borderRadius: "1.5rem" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Status badge */}
        {status !== "none" && (
          <div style={{ position: "absolute", top: 8, left: 8, zIndex: 30 }}>
            {status === "known" ? (
              <span style={{ background: "#10b981", color: "white", fontSize: 9, fontWeight: 900, padding: "3px 8px", borderRadius: 8, display: "flex", alignItems: "center", gap: 3, textTransform: "uppercase" }}>
                ✓ {t("Znam!").main}
              </span>
            ) : (
              <span style={{ background: "#ef4444", color: "white", fontSize: 9, fontWeight: 900, padding: "3px 8px", borderRadius: 8, display: "flex", alignItems: "center", gap: 3, textTransform: "uppercase" }}>
                ✗ {t("Učim").main}
              </span>
            )}
          </div>
        )}

        {status !== "none" && (
          <button
            onClick={handleReset}
            style={{ position: "absolute", top: 8, right: 8, zIndex: 30, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#94a3b8" }}
          >
            <RotateCcw size={12} />
          </button>
        )}

        <div className="flip-card-inner">

          {/* PREDNJA STRANA */}
          <div className="flip-card-front">
            <div style={{ flex: 1, background: "#f8fafc", position: "relative", overflow: "hidden" }}>
              {category === 'abeceda' ? (
                <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {imageUrl && <img src={imageUrl} alt={wordHr} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
                  <span style={{ position: "relative", fontSize: 90, fontWeight: 900, color: "white", lineHeight: 1, textShadow: "none", WebkitTextStroke: "0" }}>{wordHr}</span>
                </div>
              ) : wordType === 'broj' ? (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <span style={{ fontSize: 72, fontWeight: 900, color: "white", lineHeight: 1 }}>{wordHr.split(' ')[0]}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 2 }}>{wordHr}</span>
                </div>
              ) : imageUrl ? (
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  <img src={imageUrl} alt={wordHr} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {/* HR naziv overlay */}
                  <div style={{
                    position: "absolute",
                    bottom: 0, left: 0, right: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)",
                    padding: "28px 12px 10px",
                    textAlign: "center"
                  }}>
                    <span style={{ color: "white", fontWeight: 900, fontSize: 18, textShadow: "0 1px 4px rgba(0,0,0,0.4)", letterSpacing: 0.5 }}>
                      {wordHr}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ fontSize: 32 }}>🖼️</span>
                  <p style={{ color: "#cbd5e1", fontSize: 11, fontWeight: 700 }}>Nema slike</p>
                </div>
              )}

              {wordType && category !== 'abeceda' && (
                <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(255,255,255,0.9)", color: "#64748b", fontSize: 9, fontWeight: 900, padding: "3px 8px", borderRadius: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                  {wordType}
                </span>
              )}

              <button
                onClick={playAudio}
                style={{ position: "absolute", bottom: 10, right: 10, background: "#f97316", color: "white", border: "none", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(249,115,22,0.4)" }}
              >
                <Volume2 size={16} />
              </button>
            </div>

            <div style={{ padding: "10px 16px", textAlign: "center", background: "white" }}>
              <p style={{ fontSize: 10, color: "#cbd5e1", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>
                {t("Tap za prijevod").main} →
              </p>
            </div>
          </div>

          {/* STRAŽNJA STRANA */}
          <div className="flip-card-back">
            <div style={{ flex: 1, background: "linear-gradient(135deg, #2563eb, #7c3aed)", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
              {imageUrl && (
                <img src={imageUrl} alt={wordHr} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: category === 'abeceda' ? 1 : 0.1 }} />
              )}
              {category === 'abeceda' && (
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(37,99,235,0.4), rgba(124,58,237,0.4))" }} />
              )}
              <div style={{ position: "relative", textAlign: "center" }}>
                <h3 style={{ fontSize: category === 'abeceda' ? 80 : 24, fontWeight: 900, color: "white", lineHeight: 1.2, marginBottom: 6, textShadow: category === 'abeceda' ? "0 2px 8px rgba(0,0,0,0.4)" : "none" }}>
                  {wordHr}
                </h3>
                <p style={{ fontSize: 13, color: "rgba(191,219,254,0.9)", fontStyle: "italic" }}>
                  {euTranslation}
                </p>
              </div>
              <button
                onClick={playAudio}
                style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(255,255,255,0.2)", color: "white", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <Volume2 size={15} />
              </button>
            </div>

            <div style={{ padding: "12px 16px", background: "white" }}>
              <p style={{ fontSize: 18, fontWeight: 900, color: "#2563eb", textAlign: "center", marginBottom: 10 }}>
                {nativeTranslation}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleUnknown}
                  style={{ flex: 1, padding: "8px 0", borderRadius: 12, fontSize: 11, fontWeight: 900, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: status === "unknown" ? "#ef4444" : "#fef2f2", color: status === "unknown" ? "white" : "#ef4444" }}
                >
                  <XCircle size={13} /> {t("Učim").main}
                </button>
                <button
                  onClick={handleKnown}
                  style={{ flex: 1, padding: "8px 0", borderRadius: 12, fontSize: 11, fontWeight: 900, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: status === "known" ? "#10b981" : "#f0fdf4", color: status === "known" ? "white" : "#10b981" }}
                >
                  <CheckCircle2 size={13} /> {t("Znam!").main}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}