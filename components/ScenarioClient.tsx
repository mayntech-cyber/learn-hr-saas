"use client";

import { useState } from "react";
import { ArrowLeft, MessageSquare, Volume2, XCircle, CheckCircle2, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";

export default function ScenarioClient({ scenarios, job, category }: { scenarios: any[], job?: any, category?: any }) {
  const { euLang, nativeLang, t, uiMode } = useLanguage();

  // Flip kartica state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<number[]>([]);
  const [learningIds, setLearningIds] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  // 1. STATIČNI PRIJEVODI
  const back = job ? t("Nazad na izbornik zanimanja") : t("Nazad na scenarije");
  const scenTitle = t("Scenariji");
  const emptyMsg = t("U pripremi... rečenice stižu uskoro!");

  // 2. DINAMIČNI NAZIV ZANIMANJA / KATEGORIJE
  const getJobName = () => {
    if (!job) return "";
    if (uiMode === 'hr') return job.name_hr;
    const trans = job.translations || {};
    if (uiMode === 'native' && trans[nativeLang]) return trans[nativeLang];
    if (uiMode === 'eu' && trans[euLang]) return trans[euLang];
    return job.name_hr;
  };

  const getCategoryName = () => {
    if (!category) return "";
    if (uiMode === 'hr') return category.name_hr;
    const trans = category.translations || {};
    if (uiMode === 'native' && trans[nativeLang]) return trans[nativeLang];
    if (uiMode === 'eu' && trans[euLang]) return trans[euLang];
    return category.name_hr;
  };

  const jobName = getJobName();
  const categoryName = getCategoryName();

  // 3. AUDIO FUNKCIJA
  const playAudio = (text: string, audioUrl?: string) => {
    if (audioUrl) {
      new Audio(audioUrl).play();
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hr-HR';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Slika scenarija — pokušaj s prvog elementa, fallback null
  const bgImage = scenarios[0]?.image_url || scenarios[0]?.icon_name || null;

  return (
    <div className="p-4 md:p-10 min-h-screen flex flex-col animate-in fade-in duration-500">

      {/* --- DVOJEZIČNI HEADER --- */}
      <div className="mb-8">
        <Link href={job?.id ? `/learn/${job.id}` : '/general/scenarios'} className="group inline-flex flex-col mb-6">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
            <ArrowLeft size={16} />
            <span>{back.main}</span>
          </div>
          {!back.isOnlyHr && (
            <span className="text-[10px] font-bold text-slate-300 ml-6 uppercase tracking-tighter italic">
              {back.sub}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-md">
            <MessageSquare size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-none flex items-center gap-2 flex-wrap">
              <span>{scenTitle.main}:</span>
              <span className="text-emerald-600">{job ? jobName : categoryName}</span>
            </h1>
            {!scenTitle.isOnlyHr && (
              <p className="text-[11px] font-black text-emerald-500 uppercase mt-1 tracking-widest italic opacity-80">
                {scenTitle.sub}: {job ? job.name_hr : category?.name_hr}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- PRAZNO STANJE --- */}
      {!scenarios || scenarios.length === 0 ? (
        <div className="text-center flex flex-col items-center justify-center p-20 bg-white rounded-[2rem] border border-dashed border-slate-200 text-slate-400">
          <span className="font-bold">{emptyMsg.main}</span>
          {!emptyMsg.isOnlyHr && <span className="text-[10px] uppercase font-black mt-2 tracking-widest">{emptyMsg.sub}</span>}
        </div>

      ) : finished ? (
        /* --- CELEBRATION SCREEN --- */
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', maxWidth: 420, margin: '0 auto' }}>
          <div style={{ fontSize: 80, lineHeight: 1, marginBottom: '1.5rem' }}>🎉</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', marginBottom: '0.5rem' }}>
            Bravo! Završio si scenarij!
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '2rem' }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{knownIds.length} ✓ znaš</span>
            {' · '}
            <span style={{ color: '#ef4444', fontWeight: 700 }}>{learningIds.length} ✗ učiš</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => { setCurrentIndex(0); setFlipped(false); setKnownIds([]); setLearningIds([]); setFinished(false); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.875rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: 16, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}
            >
              <RefreshCcw size={18} /> Ponovi
            </button>
            <Link
              href={job?.id ? `/learn/${job.id}` : '/general/scenarios'}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.875rem', background: '#f1f5f9', color: '#475569', borderRadius: 16, fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <ArrowLeft size={18} /> Nazad na scenarije
            </Link>
          </div>
        </div>

      ) : (() => {
        /* --- FLIP KARTICA --- */
        const s = scenarios[currentIndex];
        const trans = typeof s.translations === 'string' ? JSON.parse(s.translations) : s.translations;
        const progressPct = (currentIndex / scenarios.length) * 100;
        const nativeTrans = trans?.[nativeLang] || '';
        const euTrans = trans?.[euLang] || '';

        const goNext = () => {
          setFlipped(false);
          setTimeout(() => {
            if (currentIndex < scenarios.length - 1) setCurrentIndex(i => i + 1);
            else setFinished(true);
          }, 250);
        };

        const handleKnown = (e: React.MouseEvent) => {
          e.stopPropagation();
          setKnownIds(ids => [...ids.filter(id => id !== s.id), s.id]);
          setLearningIds(ids => ids.filter(id => id !== s.id));
          goNext();
        };

        const handleLearning = (e: React.MouseEvent) => {
          e.stopPropagation();
          setLearningIds(ids => [...ids.filter(id => id !== s.id), s.id]);
          setKnownIds(ids => ids.filter(id => id !== s.id));
          goNext();
        };

        const cardBorder = knownIds.includes(s.id)
          ? '3px solid #34d399'
          : learningIds.includes(s.id)
          ? '3px solid #f87171'
          : '3px solid transparent';

        const gradientFallback = 'linear-gradient(135deg, #059669 0%, #0284c7 100%)';

        return (
          <>
            <style>{`
              .sc-flip { perspective: 1200px; cursor: pointer; position: relative; width: 100%; }
              .sc-flip-inner {
                position: relative; width: 100%;
                height: 340px;
                transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
                transform-style: preserve-3d;
              }
              @media (min-width: 768px) { .sc-flip-inner { height: 420px; } }
              .sc-flip.flipped .sc-flip-inner { transform: rotateY(180deg); }
              .sc-front, .sc-back {
                position: absolute; inset: 0;
                backface-visibility: hidden; -webkit-backface-visibility: hidden;
                border-radius: 1.75rem; overflow: hidden;
              }
              .sc-back { transform: rotateY(180deg); }
            `}</style>

            <div style={{ maxWidth: '100%', margin: '0 auto', width: '100%' }}>

              {/* NAVIGACIJSKI RED — izvan flip kartice, nema event konflikta */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                {knownIds.includes(s.id) ? (
                  <span style={{ background: '#10b981', color: 'white', fontSize: '0.7rem', fontWeight: 900, padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                    ✓ Znam
                  </span>
                ) : learningIds.includes(s.id) ? (
                  <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 900, padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                    ✗ Učim
                  </span>
                ) : (
                  <span />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {currentIndex > 0 && (
                    <button
                      onClick={() => { setFlipped(false); setCurrentIndex(i => i - 1); }}
                      style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', lineHeight: 1 }}
                    >
                      ←
                    </button>
                  )}
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>
                    {currentIndex + 1} / {scenarios.length}
                  </span>
                </div>
              </div>

              {/* KARTICA */}
              <div
                className={`sc-flip${flipped ? ' flipped' : ''}`}
                style={{ border: cardBorder, borderRadius: '1.75rem', isolation: 'isolate', willChange: 'transform' }}
                onClick={() => setFlipped(f => !f)}
              >
                <div className="sc-flip-inner">

                  {/* PREDNJA STRANA */}
                  <div className="sc-front">
                    {/* Pozadina */}
                    {bgImage
                      ? <img src={bgImage} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ position: 'absolute', inset: 0, background: gradientFallback }} />
                    }
                    {/* Gradient overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.30) 50%, transparent 100%)' }} />

                    {/* Sredina: hrvatska fraza */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.75rem 5rem' }}>
                      <p style={{ fontSize: 'clamp(1.35rem, 4vw, 1.9rem)', fontWeight: 900, color: 'white', lineHeight: 1.35, textAlign: 'center', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        "{s.phrase_hr}"
                      </p>
                    </div>

                    {/* Dolje: progress bar + hint + audio */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 16px 16px' }}>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', marginBottom: 10 }}>
                        👆 Tap za prijevod
                      </p>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progressPct}%`, background: '#10b981', borderRadius: 99, transition: 'width 0.35s ease' }} />
                      </div>
                    </div>

                    {/* Audio gumb */}
                    <button
                      onClick={(e) => { e.stopPropagation(); playAudio(s.phrase_hr, s.audio_url); }}
                      style={{ position: 'absolute', bottom: 14, right: 16, background: '#f97316', color: 'white', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 14px rgba(249,115,22,0.5)' }}
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>

                  {/* POLEĐINA */}
                  <div className="sc-back">
                    {/* Ista pozadina */}
                    {bgImage
                      ? <img src={bgImage} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ position: 'absolute', inset: 0, background: gradientFallback }} />
                    }
                    {/* Tamniji overlay na poleđini */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />

                    {/* Sredina: prijevodi */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.75rem 5rem', gap: '1rem', textAlign: 'center' }}>
                      {/* Native — veliki, fokus */}
                      {nativeTrans && (
                        <p style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2.1rem)', fontWeight: 900, color: 'white', lineHeight: 1.3, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                          {nativeTrans}
                        </p>
                      )}
                      {/* EU — mali, italic, sivi */}
                      {euTrans && (
                        <p style={{ fontSize: '1rem', fontStyle: 'italic', fontWeight: 500, color: 'rgba(200,210,220,0.85)' }}>
                          {euTrans}
                        </p>
                      )}
                      {/* Fallback ako nema prijevoda */}
                      {!nativeTrans && !euTrans && (
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Prijevod nedostaje</p>
                      )}
                    </div>

                    {/* Dolje: progress bar */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 16px 16px' }}>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progressPct}%`, background: '#10b981', borderRadius: 99, transition: 'width 0.35s ease' }} />
                      </div>
                    </div>

                    {/* Audio gumb */}
                    <button
                      onClick={(e) => { e.stopPropagation(); playAudio(s.phrase_hr, s.audio_url); }}
                      style={{ position: 'absolute', bottom: 14, right: 16, background: 'rgba(249,115,22,0.85)', color: 'white', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 14px rgba(249,115,22,0.4)' }}
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>

                </div>
              </div>

              {/* GUMBI ISPOD KARTICE */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  onClick={handleLearning}
                  style={{ flex: 1, height: 52, borderRadius: 16, fontSize: '1rem', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: learningIds.includes(s.id) ? '#ef4444' : '#fef2f2', color: learningIds.includes(s.id) ? 'white' : '#ef4444', transition: 'background 0.15s, color 0.15s' }}
                >
                  <XCircle size={18} /> Učim
                </button>
                <button
                  onClick={handleKnown}
                  style={{ flex: 1, height: 52, borderRadius: 16, fontSize: '1rem', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: knownIds.includes(s.id) ? '#10b981' : '#f0fdf4', color: knownIds.includes(s.id) ? 'white' : '#10b981', transition: 'background 0.15s, color 0.15s' }}
                >
                  <CheckCircle2 size={18} /> Znam!
                </button>
              </div>

            </div>
          </>
        );
      })()}
    </div>
  );
}
