"use client";

import { useState } from "react";
import { Volume2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface FlipDictionaryCardJobProps {
  wordHr: string;
  euTranslation: string;
  nativeTranslation: string;
  imageUrl?: string;
  audioUrl?: string;
  wordType?: string;
}

export default function FlipDictionaryCardJob({
  wordHr,
  euTranslation,
  nativeTranslation,
  imageUrl,
  audioUrl,
  wordType,
}: FlipDictionaryCardJobProps) {
  const { t } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const [status, setStatus] = useState<"none" | "known" | "unknown">("none");

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

  const handleKnown = (e: React.MouseEvent) => { e.stopPropagation(); setStatus("known"); };
  const handleUnknown = (e: React.MouseEvent) => { e.stopPropagation(); setStatus("unknown"); };
  const handleReset = (e: React.MouseEvent) => { e.stopPropagation(); setStatus("none"); setIsFlipped(false); };

  const borderColor =
    status === "known" ? "2px solid #34d399" :
    status === "unknown" ? "2px solid #f87171" :
    "2px solid #f1f5f9";

  return (
    <>
      <style>{`
        .flip-card-job { perspective: 1000px; height: 260px; cursor: pointer; position: relative; width: 100%; }
        @media (min-width: 768px) { .flip-card-job { height: 320px; } }
        .flip-card-job-inner { position: relative; width: 100%; height: 100%; transition: transform 0.5s; transform-style: preserve-3d; }
        .flip-card-job.flipped .flip-card-job-inner { transform: rotateY(180deg); }
        .flip-card-job-front, .flip-card-job-back {
          position: absolute; inset: 0; backface-visibility: hidden;
          -webkit-backface-visibility: hidden; border-radius: 1.5rem;
          overflow: hidden; display: flex; flex-direction: column; background: white;
        }
        .flip-card-job-back { transform: rotateY(180deg); }
        .tap-hint { animation: tapPulse 2s ease-in-out infinite; }
        @keyframes tapPulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
      `}</style>

      <div
        className={`flip-card-job${isFlipped ? " flipped" : ""}`}
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
          <button onClick={handleReset} style={{ position: "absolute", top: 8, right: 8, zIndex: 30, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#94a3b8" }}>
            <RotateCcw size={12} />
          </button>
        )}

        <div className="flip-card-job-inner">

          {/* PREDNJA STRANA */}
          <div className="flip-card-job-front">
            {imageUrl ? (
              // SA SLIKOM — overlay stil kao opći
              <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                <img src={imageUrl} alt={wordHr} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)", padding: "28px 12px 10px", textAlign: "center" }}>
                  <span style={{ color: "white", fontWeight: 900, fontSize: 16, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{wordHr}</span>
                  <p className="tap-hint" style={{ color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 3 }}>
                    👆 {t("Tap za prijevod").main}
                  </p>
                </div>
                {wordType && (
                  <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(255,255,255,0.9)", color: "#64748b", fontSize: 9, fontWeight: 900, padding: "3px 8px", borderRadius: 8, textTransform: "uppercase" }}>
                    {wordType}
                  </span>
                )}
                <button onClick={playAudio} style={{ position: "absolute", bottom: 10, right: 10, background: "#f97316", color: "white", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(249,115,22,0.4)" }}>
                  <Volume2 size={15} />
                </button>
              </div>
            ) : (
              // BEZ SLIKE — čisti indigo gradijent s HR nazivom
              <div style={{ flex: 1, background: "linear-gradient(135deg, #1e40af, #4f46e5)", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px", gap: 8 }}>
                {wordType && (
                  <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)", fontSize: 9, fontWeight: 900, padding: "3px 8px", borderRadius: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                    {wordType}
                  </span>
                )}
                <span style={{ fontSize: 28 }}>💼</span>
                <p style={{ color: "white", fontSize: 17, fontWeight: 900, textAlign: "center", lineHeight: 1.3, textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}>
                  {wordHr}
                </p>
                <p className="tap-hint" style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, marginTop: 4 }}>
                  👆 {t("Tap za prijevod").main}
                </p>
                <button onClick={playAudio} style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(255,255,255,0.2)", color: "white", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Volume2 size={15} />
                </button>
              </div>
            )}
          </div>

          {/* STRAŽNJA STRANA */}
          <div className="flip-card-job-back">
            <div style={{ flex: 1, background: "linear-gradient(135deg, #2563eb, #7c3aed)", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
              {imageUrl && (
                <img src={imageUrl} alt={wordHr} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.1 }} />
              )}
              <div style={{ position: "relative", textAlign: "center" }}>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: "white", lineHeight: 1.2, marginBottom: 6 }}>{wordHr}</h3>
                <p style={{ fontSize: 13, color: "rgba(191,219,254,0.9)", fontStyle: "italic" }}>{euTranslation}</p>
              </div>
              <button onClick={playAudio} style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(255,255,255,0.2)", color: "white", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Volume2 size={14} />
              </button>
            </div>
            <div style={{ padding: "12px 16px", background: "white" }}>
              <p style={{ fontSize: 16, fontWeight: 900, color: "#2563eb", textAlign: "center", marginBottom: 10 }}>{nativeTranslation}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleUnknown} style={{ flex: 1, padding: "8px 0", borderRadius: 12, fontSize: 11, fontWeight: 900, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: status === "unknown" ? "#ef4444" : "#fef2f2", color: status === "unknown" ? "white" : "#ef4444" }}>
                  <XCircle size={13} /> {t("Učim").main}
                </button>
                <button onClick={handleKnown} style={{ flex: 1, padding: "8px 0", borderRadius: 12, fontSize: 11, fontWeight: 900, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: status === "known" ? "#10b981" : "#f0fdf4", color: status === "known" ? "white" : "#10b981" }}>
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