"use client";

import { useState, useRef } from "react";
import { Volume2, ArrowRight, ArrowLeft, Eye, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";

interface Word {
  id: string;
  word_hr: string;
  translations: any;
  image_url: string;
  audio_url: string;
}

export default function FlashcardPlayer({ words, job, isGeneral, onClose }: { words: Word[], job?: any, isGeneral?: boolean, onClose?: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [seenCards, setSeenCards] = useState<Set<number>>(new Set());
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [isFinished, setIsFinished] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { euLang, nativeLang, t, uiMode } = useLanguage();

  // --- DEFINICIJA PRIJEVODA (Rješava pocrtane greške) ---
  const backBtn = isGeneral 
    ? t("Nazad na testove") 
    : (job ? t("Nazad na izbornik zanimanja") : t("Nazad"));
    
  const titleText = isGeneral 
    ? t("Opća vježba") 
    : (job ? t("Vježba") : t("Opća vježba"));

  const pracSubtitle = t("Testiraj svoje znanje. Skriveni prijevodi!");
  const emptyMsg = t("Trenutno nema riječi za vježbu u ovoj kategoriji.");
  const btnShow = t("Prikaži prijevod");
  const btnBack = t("Nazad");
  const btnNext = t("Dalje");
  const tTapHint = t("Tap za prijevod");

  // URL za povratak (Koristi se samo kad NIJE isGeneral)
  const backUrl = job ? `/learn/${job.id}` : '/general';

  // --- DINAMIČNI NAZIV ZANIMANJA ---
  const getJobName = () => {
    if (!job) return "";
    if (uiMode === 'hr') return job.name_hr;
    
    const trans = job.translations || {};
    if (uiMode === 'native' && trans[nativeLang]) return trans[nativeLang];
    if (uiMode === 'eu' && trans[euLang]) return trans[euLang];
    
    return job.name_hr;
  };

  const jobName = getJobName();

  if (!euLang || !nativeLang) return null;

  // --- SCREEN ZA PRAZNU LISTU ---
  if (!words || words.length === 0) {
    return (
      <div className="p-4 md:p-10 max-w-4xl mx-auto min-h-screen flex flex-col items-center justify-center animate-in fade-in duration-500 text-slate-800">
        <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center shadow-sm flex flex-col items-center">
          <p className="text-slate-500 font-bold text-lg">{emptyMsg.main}</p>
          {!emptyMsg.isOnlyHr && <p className="text-[10px] uppercase font-black tracking-widest mt-2">{emptyMsg.sub}</p>}
          
          {/* Prikazujemo link za povratak samo ako nismo u testovima (tamo TestsClient ima svoj gumb) */}
          {!isGeneral && (
            <Link href={backUrl} className="mt-6 text-orange-500 font-bold flex items-center gap-2">
              <ArrowLeft size={16} /> {backBtn.main}
            </Link>
          )}
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  // --- AUDIO LOGIKA ---
  const playAudio = () => {
    if (currentWord.audio_url) {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(currentWord.audio_url);
      audioRef.current = audio;
      audio.play();
    } else {
      const utterance = new SpeechSynthesisUtterance(currentWord.word_hr);
      utterance.lang = 'hr-HR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const nextCard = () => {
    setShowTranslation(false);
    if (currentIndex < words.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleKnown = () => {
    const newKnown = new Set(knownCards).add(currentWord.id);
    setKnownCards(newKnown);
    if (currentIndex === words.length - 1) {
      setIsFinished(true);
    } else {
      setShowTranslation(false);
      setCurrentIndex(i => i + 1);
    }
  };

  const progress = ((currentIndex + 1) / words.length) * 100;

  // Parsiranje prijevoda riječi
  let parsedTranslations: any = {};
  if (typeof currentWord.translations === 'string') {
    try { parsedTranslations = JSON.parse(currentWord.translations); } catch (e) {}
  } else if (typeof currentWord.translations === 'object' && currentWord.translations !== null) {
    parsedTranslations = currentWord.translations;
  }

  const euTranslation = parsedTranslations[euLang] || "—";
  const nativeTranslation = parsedTranslations[nativeLang] || "—";

  const earnedXP = knownCards.size * 5;
  const knownRatio = words.length > 0 ? knownCards.size / words.length : 0;
  const xpBadgeGradient = knownRatio >= 0.7
    ? 'linear-gradient(135deg, #10b981, #059669)'
    : knownRatio >= 0.4
      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
      : 'linear-gradient(135deg, #f97316, #ea580c)';

  if (isFinished) {
    const xp = knownCards.size * 5;
    return (
      <div className="p-4 md:p-10 flex flex-col animate-in fade-in duration-500 max-w-4xl mx-auto w-full items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 p-10 text-center max-w-md w-full">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <span style={{ fontSize: 48 }}>🎉</span>
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-2">Gotovo!</h2>
          <p className="text-slate-500 font-bold mb-6 italic">
            Znaš {knownCards.size} od {words.length} riječi.
          </p>
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-100">
            <p className="text-emerald-600 font-black text-2xl">+{xp} XP</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => { setCurrentIndex(0); setKnownCards(new Set()); setSeenCards(new Set()); setIsFinished(false); setShowTranslation(false); }}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black hover:scale-105 transition-transform"
            >
              Pokušaj ponovno
            </button>
            {onClose && (
              <button onClick={onClose} className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-colors">
                Završi
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 flex flex-col animate-in fade-in duration-500 max-w-4xl mx-auto w-full">

      {/* --- HEADER (isti layout kao ScenarioClient) --- */}
      <div style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', borderRadius: 16, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
      <div className="mb-8" style={{ marginBottom: 0 }}>
        {isGeneral && onClose ? (
          <button onClick={onClose} className="group inline-flex flex-col mb-6 text-left">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-orange-500 transition-colors">
              <ArrowLeft size={16} />
              <span>{backBtn.main}</span>
            </div>
            {!backBtn.isOnlyHr && (
              <span className="text-[10px] font-bold text-slate-300 ml-6 uppercase tracking-tighter italic">
                {backBtn.sub}
              </span>
            )}
          </button>
        ) : (
          <Link href={isGeneral ? '/quizzes' : backUrl} className="group inline-flex flex-col mb-6">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-orange-500 transition-colors">
              <ArrowLeft size={16} />
              <span>{backBtn.main}</span>
            </div>
            {!backBtn.isOnlyHr && (
              <span className="text-[10px] font-bold text-slate-300 ml-6 uppercase tracking-tighter italic">
                {backBtn.sub}
              </span>
            )}
          </Link>
        )}

        <div className="flex items-center gap-4">
          <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-md">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-none flex items-center gap-2 flex-wrap">
              <span>{titleText.main}{job && !isGeneral ? ':' : ''}</span>
              {job && !isGeneral && <span className="text-orange-500">{jobName}</span>}
            </h1>
            {!titleText.isOnlyHr && (
              <p className="text-[11px] font-black text-orange-400 uppercase mt-1 tracking-widest italic opacity-80">
                {titleText.sub}{job && !isGeneral ? `: ${job.name_hr}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* --- KARTICA (iste CSS klase i dimenzije kao ScenarioClient) --- */}
      <style>{`
        .fc-flip { perspective: 1200px; cursor: pointer; position: relative; width: 100%; }
        .fc-flip-inner {
          position: relative; width: 100%;
          height: 340px;
          transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
          transform-style: preserve-3d;
        }
        @media (min-width: 768px) { .fc-flip-inner { height: 420px; } }
        .fc-flip.flipped .fc-flip-inner { transform: rotateY(180deg); }
        .fc-front, .fc-back-face {
          position: absolute; inset: 0;
          backface-visibility: hidden; -webkit-backface-visibility: hidden;
          border-radius: 1.75rem; overflow: hidden;
        }
        .fc-back-face { transform: rotateY(180deg); }
      `}</style>

      {/* Navigacijski red iznad kartice */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ background: xpBadgeGradient, color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: 8, transition: 'background 0.5s' }}>
          +{earnedXP} XP
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {currentIndex > 0 && (
            <button
              onClick={() => { setShowTranslation(false); setCurrentIndex(i => i - 1); }}
              style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', lineHeight: 1 }}
            >
              ←
            </button>
          )}
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>
            {currentIndex + 1} / {words.length}
          </span>
        </div>
      </div>

      {/* Flip kartica */}
      <div
        key={currentIndex}
        className={`fc-flip${showTranslation ? ' flipped' : ''}`}
        style={{ borderRadius: '1.75rem', isolation: 'isolate', willChange: 'transform' }}
        onClick={() => { setShowTranslation(f => !f); setSeenCards(s => new Set(s).add(currentIndex)); }}
      >
        <div className="fc-flip-inner">

          {/* PREDNJA STRANA */}
          <div className="fc-front" style={{ background: currentWord.image_url ? undefined : 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f4c75 100%)' }}>
            {currentWord.image_url && (
              <img src={currentWord.image_url} alt={currentWord.word_hr} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            )}
            {!currentWord.image_url && <>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            </>}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.20) 50%, transparent 100%)' }} />

            {/* Riječ u sredini */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.75rem 5rem' }}>
              <p style={{ fontSize: 'clamp(1.35rem, 4vw, 1.9rem)', fontWeight: 900, color: 'white', lineHeight: 1.35, textAlign: 'center', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                {currentWord.word_hr}
              </p>
            </div>

            {/* Progress + hint dolje */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 16px 16px' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', marginBottom: 10 }}>
                👆 {tTapHint.main}
              </p>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#f97316', borderRadius: 99, transition: 'width 0.35s ease' }} />
              </div>
            </div>
          </div>

          {/* POLEĐINA */}
          <div className="fc-back-face" style={{ background: currentWord.image_url ? undefined : 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f4c75 100%)' }}>
            {currentWord.image_url && (
              <img src={currentWord.image_url} alt={currentWord.word_hr} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />

            {/* Prijevodi u sredini */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.75rem 5rem', gap: '1rem', textAlign: 'center' }}>
              {nativeTranslation && nativeTranslation !== '—' && (
                <p style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2.1rem)', fontWeight: 900, color: 'white', lineHeight: 1.3, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                  {nativeTranslation}
                </p>
              )}
              {euTranslation && euTranslation !== '—' && (
                <p style={{ fontSize: '1rem', fontStyle: 'italic', fontWeight: 500, color: 'rgba(200,210,220,0.85)' }}>
                  {euTranslation}
                </p>
              )}
            </div>

            {/* Progress dolje */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 16px 16px' }}>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#f97316', borderRadius: 99, transition: 'width 0.35s ease' }} />
              </div>
            </div>
          </div>

        </div>
        <button
          onClick={e => { e.stopPropagation(); playAudio(); }}
          style={{ position: 'absolute', bottom: 14, right: 16, zIndex: 20, background: '#f97316', color: 'white', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 14px rgba(249,115,22,0.5)' }}
        >
          <Volume2 size={18} />
        </button>
      </div>

      {/* GUMBI ISPOD */}
      {showTranslation ? (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            onClick={() => setShowTranslation(false)}
            style={{ flex: 1, height: 52, borderRadius: 16, fontSize: '1rem', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fee2e2', color: '#dc2626' }}
          >
            <ArrowLeft size={18} /> Učim
          </button>
          <button
            onClick={handleKnown}
            style={{ flex: 1, height: 52, borderRadius: 16, fontSize: '1rem', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#10b981', color: 'white' }}
          >
            Znam! ✓
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            onClick={() => { setShowTranslation(false); if (currentIndex > 0) setCurrentIndex(i => i - 1); }}
            disabled={currentIndex === 0}
            style={{ flex: 1, height: 52, borderRadius: 16, fontSize: '1rem', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#f1f5f9', color: '#475569', opacity: currentIndex === 0 ? 0.4 : 1, transition: 'opacity 0.15s' }}
          >
            <ArrowLeft size={18} /> {btnBack.main}
          </button>
          <button
            onClick={nextCard}
            disabled={currentIndex === words.length - 1}
            style={{ flex: 1, height: 52, borderRadius: 16, fontSize: '1rem', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: currentIndex === words.length - 1 ? '#94a3b8' : '#f97316', color: 'white', transition: 'background 0.15s' }}
          >
            {btnNext.main} <ArrowRight size={18} />
          </button>
        </div>
      )}

    </div>
  );
}