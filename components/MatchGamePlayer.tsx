"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Trophy, RefreshCcw, Link2 } from "lucide-react";
import { useLanguage } from "./LanguageContext";

const PAIR_COLORS = ['#8b5cf6', '#3b82f6', '#f97316', '#22c55e', '#ec4899', '#14b8a6'];

interface Word {
  id: string;
  word_hr: string;
  translations: any;
}

interface Line {
  id: string;
  x1: number; y1: number;
  x2: number; y2: number;
  color: string;
}

export default function MatchGamePlayer({ lesson, words, onClose }: { lesson: any, words: Word[], onClose: () => void }) {
  const { euLang, nativeLang, t } = useLanguage();

  const tBack = t("Nazad na Testove");
  const tTitle = t("Spoji Parove");
  const tMistakes = t("Greške");
  const tSuccess = t("Bravo!");
  const tSuccessMsg = t("Uspješno si spojio sve parove.");
  const tPlayAgain = t("Igraj ponovno");
  const tNotEnoughWords = t("Ova lekcija nema dovoljno riječi za igru (minimum 3).");

  const [hrWords, setHrWords] = useState<any[]>([]);
  const [trWords, setTrWords] = useState<any[]>([]);
  const [selectedHr, setSelectedHr] = useState<string | null>(null);
  const [selectedTr, setSelectedTr] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [pairColors, setPairColors] = useState<Record<string, string>>({});
  const [mistakes, setMistakes] = useState(0);
  const [errorIds, setErrorIds] = useState<{ hr: string; tr: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const arenaRef = useRef<HTMLDivElement>(null);
  const hrRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const trRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const initGame = () => {
    const gameWords = [...words].sort(() => 0.5 - Math.random()).slice(0, 6);
    const formattedWords = gameWords.map(w => {
      const parsed = typeof w.translations === 'string' ? JSON.parse(w.translations || '{}') : (w.translations || {});
      const translation = parsed[nativeLang] || parsed[euLang] || "—";
      return { id: w.id, hr: w.word_hr, tr: translation };
    });
    setHrWords([...formattedWords].sort(() => 0.5 - Math.random()));
    setTrWords([...formattedWords].sort(() => 0.5 - Math.random()));
    setMatchedPairs([]);
    setPairColors({});
    setMistakes(0);
    setIsFinished(false);
    setSelectedHr(null);
    setSelectedTr(null);
    setLines([]);
    hrRefs.current = {};
    trRefs.current = {};
  };

  useEffect(() => {
    if (words && words.length > 0) initGame();
  }, [words]);


  const computeLines = useCallback(() => {
    if (!arenaRef.current) return;
    const arenaRect = arenaRef.current.getBoundingClientRect();
    const newLines: Line[] = [];
    for (const id of matchedPairs) {
      const hrEl = hrRefs.current[id];
      const trEl = trRefs.current[id];
      if (!hrEl || !trEl) continue;
      const hrRect = hrEl.getBoundingClientRect();
      const trRect = trEl.getBoundingClientRect();
      newLines.push({
        id,
        x1: hrRect.right - arenaRect.left,
        y1: hrRect.top + hrRect.height / 2 - arenaRect.top,
        x2: trRect.left - arenaRect.left,
        y2: trRect.top + trRect.height / 2 - arenaRect.top,
        color: pairColors[id] || PAIR_COLORS[0],
      });
    }
    setLines(newLines);
  }, [matchedPairs, pairColors]);

  useEffect(() => {
    computeLines();
    window.addEventListener('resize', computeLines);
    return () => window.removeEventListener('resize', computeLines);
  }, [computeLines]);

  // Logika spajanja — ista kao originalna
  useEffect(() => {
    if (!selectedHr || !selectedTr) return;
    if (selectedHr === selectedTr) {
      const color = PAIR_COLORS[matchedPairs.length % PAIR_COLORS.length];
      setPairColors(prev => ({ ...prev, [selectedHr]: color }));
      const newMatched = [...matchedPairs, selectedHr];
      setMatchedPairs(newMatched);
      setSelectedHr(null);
      setSelectedTr(null);
      if (newMatched.length === hrWords.length) {
        setTimeout(() => setIsFinished(true), 700);
      }
    } else {
      setMistakes(m => m + 1);
      setErrorIds({ hr: selectedHr, tr: selectedTr });
      setTimeout(() => {
        setSelectedHr(null);
        setSelectedTr(null);
        setErrorIds(null);
      }, 400);
    }
  }, [selectedHr, selectedTr]);

  if (!words || words.length < 3) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <p className="text-slate-500 font-bold mb-4">{tNotEnoughWords.main}</p>
        <button onClick={onClose} className="bg-white px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 shadow-sm flex items-center gap-2">
          <ArrowLeft size={18} /> {tBack.main}
        </button>
      </div>
    );
  }

  const progress = hrWords.length > 0 ? (matchedPairs.length / hrWords.length) * 100 : 0;
  const xp = Math.max(10, hrWords.length * 5 - mistakes * 5);

  return (
    <div
      className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500"
    >

      <style>{`
        @keyframes mgShake {
          0%, 100% { transform: translateX(0); }
          20%  { transform: translateX(-6px); }
          40%  { transform: translateX(6px); }
          60%  { transform: translateX(-4px); }
          80%  { transform: translateX(4px); }
        }
        .mg-shake { animation: mgShake 0.4s ease; }
        @keyframes drawLine { to { stroke-dashoffset: 0; } }
      `}</style>

      {/* CELEBRATION SCREEN */}
      {isFinished ? (
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl p-10 text-center animate-in zoom-in-95 duration-500 flex flex-col items-center max-w-lg mx-auto mt-10">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-4xl font-black text-slate-800 mb-2">{tSuccess.main}</h2>
          <p className="text-slate-500 font-medium mb-4 text-lg">{tSuccessMsg.main}</p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-8 py-4 mb-8">
            <span className="text-3xl font-black text-emerald-600">+{xp} XP</span>
            {mistakes > 0 && (
              <p className="text-xs text-slate-400 mt-1">{mistakes} {tMistakes.main.toLowerCase()}</p>
            )}
          </div>
          <div className="flex gap-4 w-full">
            <button
              onClick={initGame}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <RefreshCcw size={20} /> {tPlayAgain.main}
            </button>
            <button
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-4 rounded-2xl font-black transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>
      ) : (
        /* ZAJEDNIČKI WRAPPER: header + game arena */
        <div style={{ background: 'rgba(10,30,60,0.65)', borderRadius: 16, overflow: 'hidden' }}>

          {/* HEADER + PROGRESS */}
          <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-sm font-bold transition-colors px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.18)' }}
              >
                <ArrowLeft size={16} />
                <span className="hidden md:inline">{tBack.main}</span>
              </button>

              <div className="text-center flex-1 mx-4">
                <h2 className="text-xl font-black flex items-center justify-center gap-2" style={{ color: 'white' }}>
                  <Link2 size={18} style={{ color: '#34d399' }} /> {tTitle.main}
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{lesson?.name}</p>
              </div>

              <div className="px-4 py-2 rounded-xl text-right" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}>
                <span className="text-[10px] font-black uppercase tracking-widest block" style={{ color: '#fca5a5' }}>{tMistakes.main}</span>
                <span className="text-xl font-black leading-none" style={{ color: 'white' }}>{mistakes}</span>
              </div>
            </div>

            <div>
              <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #22c55e, #14b8a6)' }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>{matchedPairs.length} / {hrWords.length}</span>
                <span className="text-xs font-bold" style={{ color: '#34d399' }}>+{xp} XP</span>
              </div>
            </div>
          </div>

          {/* GAME ARENA */}
          <div className="p-6 md:p-8" style={{ position: 'relative' }}>
          <div ref={arenaRef} style={{ position: 'relative', zIndex: 1 }}>

            {/* SVG OVERLAY za animirane linije */}
            <svg
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%', height: '100%',
                overflow: 'visible',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              {lines.map(line => {
                const dx = line.x2 - line.x1;
                const cp1x = line.x1 + dx * 0.4;
                const cp2x = line.x1 + dx * 0.6;
                return (
                  <g key={line.id}>
                    <path
                      d={`M ${line.x1},${line.y1} C ${cp1x},${line.y1} ${cp2x},${line.y2} ${line.x2},${line.y2}`}
                      stroke={line.color}
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="300"
                      strokeDashoffset="300"
                      style={{ animation: 'drawLine 0.45s ease forwards' }}
                    />
                    <circle cx={line.x1} cy={line.y1} r={4} fill={line.color} />
                    <circle cx={line.x2} cy={line.y2} r={4} fill={line.color} />
                  </g>
                );
              })}
            </svg>

            {/* GRID: lijeva i desna kolona */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>

              {/* LIJEVA KOLONA — HR RIJEČI */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {hrWords.map(word => {
                  const isMatched = matchedPairs.includes(word.id);
                  const color = pairColors[word.id];
                  const isSelected = selectedHr === word.id;
                  const isError = errorIds?.hr === word.id;
                  return (
                    <button
                      key={`hr-${word.id}`}
                      ref={el => { hrRefs.current[word.id] = el; }}
                      onClick={() => !isMatched && !errorIds && setSelectedHr(word.id)}
                      disabled={isMatched}
                      className={isError ? 'mg-shake' : ''}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 14,
                        border: `2px solid ${isMatched ? `${color}88` : isError ? '#ef4444' : isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.28)'}`,
                        background: isMatched ? `${color}59` : isError ? 'rgba(239,68,68,0.25)' : isSelected ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.14)',
                        color: isMatched ? '#fff' : isError ? '#fca5a5' : 'white',
                        fontWeight: 800,
                        fontSize: '0.875rem',
                        textAlign: 'center',
                        cursor: isMatched ? 'default' : 'pointer',
                        transition: 'border-color 0.15s, background 0.15s, color 0.15s',
                        boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(6px)',
                        textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      }}
                    >
                      {word.hr}
                    </button>
                  );
                })}
              </div>

              {/* DESNA KOLONA — PRIJEVODI */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {trWords.map(word => {
                  const isMatched = matchedPairs.includes(word.id);
                  const color = pairColors[word.id];
                  const isSelected = selectedTr === word.id;
                  const isError = errorIds?.tr === word.id;
                  return (
                    <button
                      key={`tr-${word.id}`}
                      ref={el => { trRefs.current[word.id] = el; }}
                      onClick={() => !isMatched && !errorIds && setSelectedTr(word.id)}
                      disabled={isMatched}
                      className={isError ? 'mg-shake' : ''}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 14,
                        border: `2px solid ${isMatched ? `${color}88` : isError ? '#ef4444' : isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.28)'}`,
                        background: isMatched ? `${color}59` : isError ? 'rgba(239,68,68,0.25)' : isSelected ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.14)',
                        color: isMatched ? '#fff' : isError ? '#fca5a5' : 'white',
                        fontWeight: 800,
                        fontSize: '0.875rem',
                        textAlign: 'center',
                        cursor: isMatched ? 'default' : 'pointer',
                        transition: 'border-color 0.15s, background 0.15s, color 0.15s',
                        boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(6px)',
                        textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                      }}
                    >
                      {word.tr}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
