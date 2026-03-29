"use client";

import { useState } from "react";
import { Volume2, XCircle, CheckCircle2, RefreshCcw, ArrowLeft } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import Link from "next/link";

export default function ScenarioPlayer({ steps }: { steps: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<number[]>([]);
  const [learningIds, setLearningIds] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const { euLang, nativeLang } = useLanguage();

  if (!steps.length) return <div>Nema koraka za ovaj scenarij.</div>;

  const step = steps[currentIndex];
  const trans = typeof step.translations === 'string' ? JSON.parse(step.translations) : step.translations;

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (step.audio_url) {
      new Audio(step.audio_url).play();
    } else {
      const utterance = new SpeechSynthesisUtterance(step.text_hr);
      utterance.lang = 'hr-HR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const goNext = () => {
    setFlipped(false);
    setTimeout(() => {
      if (currentIndex < steps.length - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        setFinished(true);
      }
    }, 250);
  };

  const handleKnown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setKnownIds(ids => [...ids.filter(id => id !== step.id), step.id]);
    setLearningIds(ids => ids.filter(id => id !== step.id));
    goNext();
  };

  const handleLearning = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLearningIds(ids => [...ids.filter(id => id !== step.id), step.id]);
    setKnownIds(ids => ids.filter(id => id !== step.id));
    goNext();
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setKnownIds([]);
    setLearningIds([]);
    setFinished(false);
  };

  const progress = ((currentIndex) / steps.length) * 100;

  // --- CELEBRATION SCREEN ---
  if (finished) {
    return (
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
            onClick={handleReset}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.875rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: 16, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}
          >
            <RefreshCcw size={18} /> Ponovi
          </button>
          <Link
            href="/general/scenarios"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.875rem', background: '#f1f5f9', color: '#475569', borderRadius: 16, fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none' }}
          >
            <ArrowLeft size={18} /> Nazad na scenarije
          </Link>
        </div>
      </div>
    );
  }

  // --- FLIP KARTICA ---
  return (
    <>
      <style>{`
        .scenario-flip-card { perspective: 1000px; height: 280px; cursor: pointer; position: relative; width: 100%; }
        @media (min-width: 768px) { .scenario-flip-card { height: 320px; } }
        .scenario-flip-inner { position: relative; width: 100%; height: 100%; transition: transform 0.45s ease; transform-style: preserve-3d; }
        .scenario-flip-card.flipped .scenario-flip-inner { transform: rotateY(180deg); }
        .scenario-flip-front, .scenario-flip-back {
          position: absolute; inset: 0;
          backface-visibility: hidden; -webkit-backface-visibility: hidden;
          border-radius: 1.5rem; overflow: hidden;
          display: flex; flex-direction: column;
          background: white;
        }
        .scenario-flip-back { transform: rotateY(180deg); }
      `}</style>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 0.25rem' }}>

        {/* PROGRESS BAR */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
              Fraza {currentIndex + 1} / {steps.length}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
              {knownIds.length} ✓
            </span>
          </div>
          <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', borderRadius: 99, transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* KARTICA */}
        <div
          className={`scenario-flip-card${flipped ? ' flipped' : ''}`}
          style={{
            border: knownIds.includes(step.id)
              ? '2px solid #34d399'
              : learningIds.includes(step.id)
              ? '2px solid #f87171'
              : '2px solid #f1f5f9',
            borderRadius: '1.5rem',
          }}
          onClick={() => setFlipped(f => !f)}
        >
          <div className="scenario-flip-inner">

            {/* PREDNJA STRANA — hrvatska rečenica */}
            <div className="scenario-flip-front">
              <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #1e40af, #4f46e5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1.5rem',
                position: 'relative',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', lineHeight: 1.4, textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
                  "{step.text_hr}"
                </p>
                <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>
                  👆 Tap za prijevod
                </p>
                <button
                  onClick={playAudio}
                  style={{ position: 'absolute', bottom: 12, right: 12, background: '#f97316', color: 'white', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(249,115,22,0.4)' }}
                >
                  <Volume2 size={17} />
                </button>
              </div>
            </div>

            {/* POLEĐINA — prijevodi */}
            <div className="scenario-flip-back">
              <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1.5rem',
                position: 'relative',
                textAlign: 'center',
                gap: '0.75rem',
              }}>
                <p style={{ color: 'white', fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.4 }}>
                  "{step.text_hr}"
                </p>
                <p style={{ color: 'rgba(148,163,184,0.9)', fontSize: '1rem', fontStyle: 'italic', fontWeight: 500 }}>
                  {trans?.[euLang] || '—'}
                </p>
                <p style={{ color: '#60a5fa', fontSize: '1.2rem', fontWeight: 900 }}>
                  {trans?.[nativeLang] || '—'}
                </p>
                <button
                  onClick={playAudio}
                  style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Volume2 size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* UČIM / ZNAM GUMBI */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            onClick={handleLearning}
            style={{
              flex: 1, padding: '0.75rem 0', borderRadius: 14, fontSize: '0.9rem', fontWeight: 900,
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: learningIds.includes(step.id) ? '#ef4444' : '#fef2f2',
              color: learningIds.includes(step.id) ? 'white' : '#ef4444',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <XCircle size={16} /> Učim
          </button>
          <button
            onClick={handleKnown}
            style={{
              flex: 1, padding: '0.75rem 0', borderRadius: 14, fontSize: '0.9rem', fontWeight: 900,
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: knownIds.includes(step.id) ? '#10b981' : '#f0fdf4',
              color: knownIds.includes(step.id) ? 'white' : '#10b981',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <CheckCircle2 size={16} /> Znam!
          </button>
        </div>

      </div>
    </>
  );
}
