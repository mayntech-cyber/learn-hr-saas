"use client";

import { ArrowLeft, MessageSquare, Volume2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";

// DODAN 'job' U PROPS!
export default function ScenarioClient({ scenarios, job }: { scenarios: any[], job?: any }) {
  const { euLang, nativeLang, t, uiMode } = useLanguage();

  // 1. STATIČNI PRIJEVODI
  const back = t("Nazad na izbornik zanimanja");
  const scenTitle = t("Scenariji");
  const emptyMsg = t("U pripremi... rečenice stižu uskoro!"); // NOVI PRIJEVOD!

  // 2. DINAMIČNI NAZIV ZANIMANJA
  const getJobName = () => {
    if (!job) return "";
    if (uiMode === 'hr') return job.name_hr;
    
    const trans = job.translations || {};
    if (uiMode === 'native' && trans[nativeLang]) return trans[nativeLang];
    if (uiMode === 'eu' && trans[euLang]) return trans[euLang];
    
    return job.name_hr;
  };

  const jobName = getJobName();

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

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto min-h-screen flex flex-col animate-in fade-in duration-500">
      
      {/* --- DVOJEZIČNI HEADER --- */}
      <div className="mb-8">
        <Link href={`/learn/${job?.id || ''}`} className="group inline-flex flex-col mb-6">
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
              <span className="text-emerald-600">{jobName}</span>
            </h1>
            {!scenTitle.isOnlyHr && (
              <p className="text-[11px] font-black text-emerald-500 uppercase mt-1 tracking-widest italic opacity-80">
                {scenTitle.sub}: {job?.name_hr}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- LISTA REČENICA ILI PRAZNO STANJE --- */}
      {!scenarios || scenarios.length === 0 ? (
        <div className="text-center flex flex-col items-center justify-center p-20 bg-white rounded-[2rem] border border-dashed border-slate-200 text-slate-400">
           <span className="font-bold">{emptyMsg.main}</span>
           {!emptyMsg.isOnlyHr && <span className="text-[10px] uppercase font-black mt-2 tracking-widest">{emptyMsg.sub}</span>}
        </div>
      ) : (
        <div className="space-y-4">
          {scenarios.map((s) => {
            const trans = typeof s.translations === 'string' ? JSON.parse(s.translations) : s.translations;

            return (
              <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-6 group">
                
                {/* Audio Gumb */}
                <button 
                  onClick={() => playAudio(s.phrase_hr, s.audio_url)}
                  className="w-14 h-14 shrink-0 flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white rounded-2xl transition-all shadow-inner"
                >
                  <Volume2 size={24} />
                </button>

                {/* Tekstovi */}
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">
                    {s.phrase_hr}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:gap-4 sm:items-center">
                    <p className="text-sm font-bold text-slate-400 italic">
                       {trans?.[euLang] || "—"}
                    </p>
                    <span className="hidden sm:block text-slate-200">|</span>
                    <p className="text-lg font-black text-blue-600">
                       {trans?.[nativeLang] || "—"}
                    </p>
                  </div>
                </div>

                {/* Ukrasna ikonica desno */}
                <div className="hidden md:block opacity-0 group-hover:opacity-10 text-slate-400 transition-opacity">
                   <MessageCircle size={32} />
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}