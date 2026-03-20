"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Trophy, RefreshCcw, Link2 } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface Word {
  id: string;
  word_hr: string;
  translations: any;
}

export default function MatchGamePlayer({ lesson, words, onClose }: { lesson: any, words: Word[], onClose: () => void }) {
  const { euLang, nativeLang, t } = useLanguage();
  
  // Prijevodi za sučelje
  const tBack = t("Nazad na Testove");
  const tTitle = t("Spoji Parove");
  const tMistakes = t("Greške");
  const tSuccess = t("Bravo!");
  const tSuccessMsg = t("Uspješno si spojio sve parove.");
  const tPlayAgain = t("Igraj ponovno");
  const tNotEnoughWords = t("Ova lekcija nema dovoljno riječi za igru (minimum 3)."); // <-- NOVO

  const [hrWords, setHrWords] = useState<any[]>([]);
  const [trWords, setTrWords] = useState<any[]>([]);
  const [selectedHr, setSelectedHr] = useState<string | null>(null);
  const [selectedTr, setSelectedTr] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [errorAnim, setErrorAnim] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // INICIJALIZACIJA IGRE
  const initGame = () => {
    // Uzimamo maksimalno 6 riječi za jednu rundu da ne zatrpamo ekran
    const gameWords = [...words].sort(() => 0.5 - Math.random()).slice(0, 6);
    
    // Formatiramo prijevode na temelju korisnikovog jezika (Prioritet: Materinji -> Engleski -> Prazno)
    const formattedWords = gameWords.map(w => {
      let parsed = typeof w.translations === 'string' ? JSON.parse(w.translations || '{}') : (w.translations || {});
      const translation = parsed[nativeLang] || parsed[euLang] || "—";
      return { id: w.id, hr: w.word_hr, tr: translation };
    });

    setHrWords([...formattedWords].sort(() => 0.5 - Math.random()));
    setTrWords([...formattedWords].sort(() => 0.5 - Math.random()));
    setMatchedPairs([]);
    setMistakes(0);
    setIsFinished(false);
    setSelectedHr(null);
    setSelectedTr(null);
  };

  useEffect(() => {
    if (words && words.length > 0) {
      initGame();
    }
  }, [words]);

  // LOGIKA SPAJANJA
  useEffect(() => {
    if (selectedHr && selectedTr) {
      if (selectedHr === selectedTr) {
        // TOČNO!
        setMatchedPairs(prev => [...prev, selectedHr]);
        setSelectedHr(null);
        setSelectedTr(null);
        
        if (matchedPairs.length + 1 === hrWords.length) {
          setTimeout(() => setIsFinished(true), 600);
        }
      } else {
        // KRIVO!
        setMistakes(m => m + 1);
        setErrorAnim(true);
        setTimeout(() => {
          setSelectedHr(null);
          setSelectedTr(null);
          setErrorAnim(false);
        }, 800);
      }
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 animate-in fade-in duration-500">
      
      {/* HEADER IGRE */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-500 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100"
        >
          <ArrowLeft size={16} /> <span className="hidden md:inline">{tBack.main}</span>
        </button>
        
        <div className="text-center flex-1 mx-4">
          <h2 className="text-2xl font-black text-slate-800 flex items-center justify-center gap-2">
            <Link2 className="text-emerald-500" /> {tTitle.main}
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{lesson?.name}</p>
        </div>

        <div className="bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm">
          <span className="text-xs font-black text-red-400 uppercase tracking-widest block">{tMistakes.main}</span>
          <span className="text-xl font-black text-slate-800 leading-none">{mistakes}</span>
        </div>
      </div>

      {/* REZULTAT (AKO JE GOTOVO) */}
      {isFinished ? (
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl p-10 text-center animate-in zoom-in-95 duration-500 flex flex-col items-center max-w-lg mx-auto mt-10">
          <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <Trophy size={48} className="text-emerald-500" />
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-2">{tSuccess.main}</h2>
          <p className="text-slate-500 font-medium mb-8 text-lg">{tSuccessMsg.main}</p>
          
          <div className="flex gap-4 w-full">
            <button onClick={initGame} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
              <RefreshCcw size={20} /> {tPlayAgain.main}
            </button>
            <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-4 rounded-2xl font-black transition-colors">
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>
      ) : (
       /* GLAVNA IGRA */
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 md:p-10">
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            
            {/* LIJEVI STUPAC (HRVATSKI - PLAVA TEMA) */}
            <div className="space-y-3 md:space-y-4">
              {hrWords.map((word) => {
                const isMatched = matchedPairs.includes(word.id);
                const isSelected = selectedHr === word.id;
                const isError = isSelected && errorAnim;
                
                return (
                  <button
                    key={`hr-${word.id}`}
                    onClick={() => !isMatched && setSelectedHr(word.id)}
                    disabled={isMatched}
                    className={`w-full p-4 md:p-5 rounded-2xl border-2 font-black text-sm md:text-lg text-center transition-all duration-300
                      ${isMatched ? 'bg-slate-50 border-slate-100 text-slate-300 scale-95 opacity-40 pointer-events-none' : 
                        isError ? 'bg-red-50 border-red-500 text-red-600 animate-shake' :
                        isSelected ? 'bg-blue-50 border-blue-500 text-blue-700 scale-105 shadow-xl shadow-blue-500/20 z-10 relative' : 
                        'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50 shadow-sm hover:-translate-y-1'}`}
                  >
                    {word.hr}
                  </button>
                );
              })}
            </div>

            {/* DESNI STUPAC (PRIJEVODI - NARANČASTA TEMA) */}
            <div className="space-y-3 md:space-y-4">
              {trWords.map((word) => {
                const isMatched = matchedPairs.includes(word.id);
                const isSelected = selectedTr === word.id;
                const isError = isSelected && errorAnim;
                
                return (
                  <button
                    key={`tr-${word.id}`}
                    onClick={() => !isMatched && setSelectedTr(word.id)}
                    disabled={isMatched}
                    className={`w-full p-4 md:p-5 rounded-2xl border-2 font-black text-sm md:text-lg text-center transition-all duration-300
                      ${isMatched ? 'bg-slate-50 border-slate-100 text-slate-300 scale-95 opacity-40 pointer-events-none' : 
                        isError ? 'bg-red-50 border-red-500 text-red-600 animate-shake' :
                        isSelected ? 'bg-orange-50 border-orange-500 text-orange-700 scale-105 shadow-xl shadow-orange-500/20 z-10 relative' : 
                        'bg-white border-slate-200 text-slate-700 hover:border-orange-400 hover:bg-orange-50/50 shadow-sm hover:-translate-y-1'}`}
                  >
                    {word.tr}
                  </button>
                );
              })}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}