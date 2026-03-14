"use client";

import { Volume2 } from "lucide-react";

interface DictionaryCardProps {
  wordHr: string;
  euTranslation: string;
  nativeTranslation: string;
  imageUrl: string;
  audioUrl?: string;
}

export default function DictionaryCard({ 
  wordHr, 
  euTranslation, 
  nativeTranslation, 
  imageUrl, 
  audioUrl 
}: DictionaryCardProps) {
  
  // Pametna funkcija za zvuk
  const playAudio = (e: React.MouseEvent) => {
    e.preventDefault(); // Sprječava skakanje stranice
    if (audioUrl) {
      // 1. Ako imamo tvoj MP3 u bazi, sviraj njega
      new Audio(audioUrl).play();
    } else {
      // 2. Ako nemamo MP3, koristi ugrađeni hrvatski glas preglednika!
      const utterance = new SpeechSynthesisUtterance(wordHr);
      utterance.lang = 'hr-HR'; // Forsiramo hrvatski naglasak
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group">
      
      {/* Slika + Zvuk */}
      <div className="h-48 w-full bg-slate-50 relative border-b border-slate-100">
        {imageUrl ? (
          <img src={imageUrl} alt={wordHr} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 font-medium">Nema slike</div>
        )}
        
        {/* GUMB JE SADA UVIJEK VIDLJIV! */}
        <button 
          onClick={playAudio}
          title={audioUrl ? "Originalni izgovor" : "Kompjuterski izgovor"}
          className="absolute bottom-3 right-3 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transition-transform transform active:scale-95 group-hover:scale-110 flex items-center justify-center"
        >
          <Volume2 size={20} />
        </button>
      </div>

      {/* 3 Jezika */}
      <div className="p-5 flex flex-col flex-1 text-center justify-center bg-white">
        <h3 className="text-xl font-black text-slate-800 mb-1 leading-tight">{wordHr}</h3>
        <p className="text-sm font-medium text-slate-400 italic mb-3">{euTranslation}</p>
        <p className="text-lg font-bold text-blue-600 mt-auto">{nativeTranslation}</p>
      </div>

    </div>
  );
}