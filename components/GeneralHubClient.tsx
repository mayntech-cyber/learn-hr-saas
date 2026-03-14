"use client";

import { BookOpen, MessageSquare, BrainCircuit, Globe2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";

export default function GeneralHubClient() {
  const { t } = useLanguage();

  // --- PRIJEVODI IZ BAZE ---
  const title = t("Opći jezik");
  const subtitle = t("Osnove hrvatskog jezika, pozdravi, brojevi i svakodnevna komunikacija.");

  const dict = t("Rječnik");
  const dictDesc = t("Pretraži stotine općih riječi uz pametne filtere.");
  const dictBtn = t("Otvori Rječnik");

  const scen = t("Scenariji");
  const scenDesc = t("Nauči svakodnevne rečenice u trgovini, kod doktora i na ulici.");
  const scenBtn = t("Otvori Scenarije");

  const prac = t("Vježba");
  const pracDesc = t("Testiraj naučene opće riječi kroz interaktivne kartice.");
  const pracBtn = t("Započni vježbu");

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto min-h-screen flex flex-col animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="mb-12 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-5 mb-4 justify-center md:justify-start">
          <div className="bg-blue-600 p-4 rounded-[1.5rem] text-white shadow-lg shadow-blue-200">
            <Globe2 size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-none">
              {title.main}
            </h1>
            {!title.isOnlyHr && (
              <p className="text-xs md:text-sm font-black text-blue-400 uppercase mt-1 tracking-widest italic opacity-80">
                {title.sub}
              </p>
            )}
          </div>
        </div>
        
        <div className="text-slate-500 font-medium text-lg max-w-2xl leading-tight">
           <p>{subtitle.main}</p>
           {!subtitle.isOnlyHr && (
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
               {subtitle.sub}
             </p>
           )}
        </div>
      </div>

      {/* GLAVNE KARTICE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        
        {/* 1. RJEČNIK */}
        <Link href="/general/dictionary" className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center h-full">
          <div className="bg-blue-50 p-6 rounded-full text-blue-600 mb-6 group-hover:scale-110 transition-transform shadow-inner">
            <BookOpen size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-1">{dict.main}</h2>
          {!dict.isOnlyHr && <p className="text-[10px] font-bold text-blue-400 uppercase mb-4 tracking-tighter italic">{dict.sub}</p>}
          
          <div className="text-slate-500 font-medium mb-8 flex-1">
             <p>{dictDesc.main}</p>
             {!dictDesc.isOnlyHr && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase italic">{dictDesc.sub}</p>}
          </div>
          <span className="w-full bg-blue-100 text-blue-700 font-black py-4 rounded-2xl text-xs uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {dictBtn.main}
          </span>
        </Link>

        {/* 2. SCENARIJI */}
        <Link href="/general/scenarios" className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center h-full">
          <div className="bg-emerald-50 p-6 rounded-full text-emerald-600 mb-6 group-hover:scale-110 transition-transform shadow-inner">
            <MessageSquare size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-1">{scen.main}</h2>
          {!scen.isOnlyHr && <p className="text-[10px] font-bold text-emerald-500 uppercase mb-4 tracking-tighter italic">{scen.sub}</p>}
          
          <div className="text-slate-500 font-medium mb-8 flex-1">
             <p>{scenDesc.main}</p>
             {!scenDesc.isOnlyHr && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase italic">{scenDesc.sub}</p>}
          </div>
          <span className="w-full bg-emerald-100 text-emerald-700 font-black py-4 rounded-2xl text-xs uppercase tracking-wider group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            {scenBtn.main}
          </span>
        </Link>

        {/* 3. VJEŽBA */}
        <Link href="/general/practice" className="group bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-lg hover:shadow-xl transition-all flex flex-col items-center text-center h-full">
          <div className="bg-white/10 p-6 rounded-full text-orange-400 mb-6 group-hover:scale-110 transition-transform">
            <BrainCircuit size={48} />
          </div>
          <h2 className="text-2xl font-black text-white mb-1">{prac.main}</h2>
          {!prac.isOnlyHr && <p className="text-[10px] font-bold text-orange-400 uppercase mb-4 tracking-tighter italic">{prac.sub}</p>}
          
          <div className="text-slate-300 font-medium mb-8 flex-1">
             <p>{pracDesc.main}</p>
             {!pracDesc.isOnlyHr && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase italic">{pracDesc.sub}</p>}
          </div>
          <span className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-md group-hover:bg-orange-600 transition-colors text-xs uppercase tracking-wider">
            {pracBtn.main}
          </span>
        </Link>

      </div>
    </div>
  );
}