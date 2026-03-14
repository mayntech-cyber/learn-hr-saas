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

// DODALI SMO 'job' U PROPS KAKO BI ZNALI NAZIV ZANIMANJA ZA HEADER
export default function FlashcardPlayer({ words, job }: { words: Word[], job?: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { euLang, nativeLang, t, uiMode } = useLanguage();

  // --- STATIČNI PRIJEVODI ZA SUČELJE ---
  // PAMETNI PRIJEVODI: Provjeravamo je li ovo Opća vježba (nema job) ili Stručna (ima job)
  const back = job ? t("Nazad na izbornik zanimanja") : t("Nazad");
  const pracTitle = job ? t("Vježba") : t("Opća vježba");
  const pracSubtitle = t("Testiraj svoje znanje. Skriveni prijevodi!");
  const emptyMsg = t("Trenutno nema riječi za vježbu u ovoj kategoriji.");
  const btnShow = t("Prikaži prijevod");
  const btnBack = t("Nazad");
  const btnNext = t("Dalje");
  const noImage = t("Nema slike");

  // --- DINAMIČNI NAZIV ZANIMANJA (Prebacuje se ovisno o jeziku) ---
  const getJobName = () => {
    if (!job) return "";
    if (uiMode === 'hr') return job.name_hr;
    
    const trans = job.translations || {};
    if (uiMode === 'native' && trans[nativeLang]) return trans[nativeLang];
    if (uiMode === 'eu' && trans[euLang]) return trans[euLang];
    
    return job.name_hr;
  };

  const jobName = getJobName();

  // URL za povratak (Ako je opći jezik, vodi na /general, inače na struku)
  const backUrl = job ? `/learn/${job.id}` : '/general';

  if (!euLang || !nativeLang) return null;

  if (!words || words.length === 0) {
    return (
      <div className="p-4 md:p-10 max-w-4xl mx-auto min-h-screen flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center shadow-sm flex flex-col items-center">
          <p className="text-slate-500 font-bold text-lg">{emptyMsg.main}</p>
          {!emptyMsg.isOnlyHr && <p className="text-[10px] uppercase font-black tracking-widest mt-2">{emptyMsg.sub}</p>}
          {/* OVDJE SMO STAVILI PAMETNI LINK */}
          <Link href={backUrl} className="mt-6 text-orange-500 font-bold flex items-center gap-2">
            <ArrowLeft size={16} /> {back.main}
          </Link>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  // --- LOGIKA ZA KARTICE ---
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

  const prevCard = () => {
    setShowTranslation(false);
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const progress = ((currentIndex + 1) / words.length) * 100;

  let parsedTranslations: any = {};
  if (typeof currentWord.translations === 'string') {
    try { parsedTranslations = JSON.parse(currentWord.translations); } catch (e) {}
  } else if (typeof currentWord.translations === 'object' && currentWord.translations !== null) {
    parsedTranslations = currentWord.translations;
  }

  const euTranslation = parsedTranslations[euLang] || "—";
  const nativeTranslation = parsedTranslations[nativeLang] || "—";

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto min-h-screen flex flex-col animate-in fade-in duration-500">
      
      {/* --- DVOJEZIČNI HEADER --- */}
      <div className="mb-8 w-full max-w-md mx-auto md:max-w-none md:mx-0">
        
        {/* OVDJE SMO STAVILI PAMETNI LINK */}
        <Link href={backUrl} className="group inline-flex flex-col mb-6">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-orange-500 transition-colors">
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
          <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-md">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-none flex items-center gap-2 flex-wrap">
              <span>{pracTitle.main}{job ? ":" : ""}</span> 
              {job && <span className="text-orange-500">{jobName}</span>}
            </h1>
            {!pracTitle.isOnlyHr && (
              <p className="text-[11px] font-black text-orange-400 uppercase mt-1 tracking-widest italic opacity-80">
                {pracTitle.sub}{job ? `: ${job.name_hr}` : ""}
              </p>
            )}
            
            <div className="text-slate-500 font-medium mt-3 leading-tight">
               <p>{pracSubtitle.main}</p>
               {!pracSubtitle.isOnlyHr && (
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                   {pracSubtitle.sub}
                 </p>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* --- FLASHCARD PLAYER --- */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-md mx-auto space-y-6">
          
          {/* PROGRESS BAR */}
          <div className="flex items-center justify-between text-sm font-bold text-slate-400 mb-2">
            <span>{currentIndex + 1} / {words.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>

          {/* GLAVNA KARTICA */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col relative">
            
            {/* Slika */}
            <div className="h-64 w-full bg-slate-100 relative">
              {currentWord.image_url ? (
                <img src={currentWord.image_url} alt={currentWord.word_hr} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 font-medium text-sm">
                  {noImage.main}
                </div>
              )}
              
              <button 
                onClick={playAudio}
                className="absolute bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 flex items-center justify-center z-10"
              >
                <Volume2 size={28} />
              </button>
            </div>

            {/* Tekstovi */}
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[160px]">
              <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-3">
                {currentWord.word_hr}
              </h2>
              
              {showTranslation ? (
                <div className="space-y-2 animate-in fade-in w-full">
                  <p className="text-lg font-medium text-slate-500 italic">
                    {euTranslation}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {nativeTranslation}
                  </p>
                </div>
              ) : (
                <button 
                  onClick={() => setShowTranslation(true)}
                  className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 bg-slate-50 px-4 py-2 rounded-xl transition-colors"
                >
                  <Eye size={16} /> <span>{btnShow.main}</span>
                </button>
              )}
            </div>
          </div>

          {/* KONTROLE */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <button 
              onClick={prevCard} 
              disabled={currentIndex === 0}
              className="flex-1 bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft size={20} /> <span>{btnBack.main}</span>
              </div>
            </button>
            <button 
              onClick={nextCard}
              disabled={currentIndex === words.length - 1}
              className="flex-1 bg-orange-500 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors shadow-md"
            >
              <div className="flex items-center gap-2">
                <span>{btnNext.main}</span> <ArrowRight size={20} />
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}