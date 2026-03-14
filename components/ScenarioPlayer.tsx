"use client";

import { useState } from "react";
import { Volume2, ChevronRight, ChevronLeft, RefreshCcw } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function ScenarioPlayer({ steps }: { steps: any[] }) {
  const [current, setCurrent] = useState(0);
  const { euLang, nativeLang } = useLanguage();

  if (!steps.length) return <div>Nema koraka za ovaj scenarij.</div>;

  const step = steps[current];
  const trans = typeof step.translations === 'string' ? JSON.parse(step.translations) : step.translations;

  const playAudio = () => {
    if (step.audio_url) {
      new Audio(step.audio_url).play();
    } else {
      const utterance = new SpeechSynthesisUtterance(step.text_hr);
      utterance.lang = 'hr-HR';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
      {/* Gornji dio - Rečenica */}
      <div className="p-8 md:p-12 text-center space-y-6">
        <div className="inline-block px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
            Korak {current + 1} od {steps.length}
        </div>
        
        <h2 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">
          "{step.text_hr}"
        </h2>

        <div className="space-y-2">
            <p className="text-lg text-slate-400 italic font-medium">{trans?.[euLang]}</p>
            <p className="text-2xl text-blue-600 font-black">{trans?.[nativeLang]}</p>
        </div>

        <button 
          onClick={playAudio}
          className="mx-auto mt-4 w-16 h-16 flex items-center justify-center bg-orange-500 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
        >
          <Volume2 size={32} />
        </button>
      </div>

      {/* Kontrole */}
      <div className="bg-slate-50 p-6 flex items-center justify-between border-t border-slate-100">
        <button 
          disabled={current === 0}
          onClick={() => setCurrent(c => c - 1)}
          className="p-4 text-slate-400 hover:text-slate-800 disabled:opacity-20"
        >
          <ChevronLeft size={32} />
        </button>

        {current === steps.length - 1 ? (
          <button 
            onClick={() => setCurrent(0)}
            className="flex items-center gap-2 bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all"
          >
            <RefreshCcw size={20} /> Ponovi ispočetka
          </button>
        ) : (
          <button 
            onClick={() => setCurrent(c => c + 1)}
            className="flex items-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-md transition-all"
          >
            Sljedeće <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}