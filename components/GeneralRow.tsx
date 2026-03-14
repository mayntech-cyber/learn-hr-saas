"use client";

import { Volume2 } from "lucide-react";

interface GeneralRowProps {
  wordHr: string;
  euTranslation: string;
  nativeTranslation: string;
  audioUrl?: string;
  type: string; // npr. imenica, glagol...
}

export default function GeneralRow({ 
  wordHr, 
  euTranslation, 
  nativeTranslation, 
  audioUrl,
  type 
}: GeneralRowProps) {
  
  const playAudio = () => {
    if (audioUrl) {
      new Audio(audioUrl).play();
    } else {
      const utterance = new SpeechSynthesisUtterance(wordHr);
      utterance.lang = 'hr-HR';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="group bg-white border-b border-slate-100 hover:bg-blue-50/50 transition-colors px-4 py-4 flex items-center gap-4">
      
      {/* Tip riječi (Mala oznaka) */}
      <div className="hidden md:block w-24">
        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
          {type}
        </span>
      </div>

      {/* HRVATSKI */}
      <div className="flex-1 min-w-[120px]">
        <h3 className="text-lg font-bold text-slate-800">{wordHr}</h3>
      </div>

      {/* POMOĆNI (EU) */}
      <div className="flex-1 hidden sm:block">
        <p className="text-sm font-medium text-slate-400 italic">{euTranslation}</p>
      </div>

      {/* MATERINJI (Native) */}
      <div className="flex-1 text-right sm:text-left">
        <p className="text-lg font-black text-blue-600">{nativeTranslation}</p>
      </div>

      {/* AUDIO GUMB */}
      <button 
        onClick={playAudio}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-orange-500 hover:text-white transition-all active:scale-90"
      >
        <Volume2 size={18} />
      </button>

    </div>
  );
}