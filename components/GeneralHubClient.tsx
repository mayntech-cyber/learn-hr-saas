"use client";

import { useEffect, useState } from "react";
import { BookOpen, MessageSquare, BrainCircuit, Globe2, Puzzle, FileDown } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";
import { createClient } from "@/utils/supabase/client"; // ✅ Novi import za klijent

export default function GeneralHubClient() {
  // ✅ Inicijaliziramo Supabase klijent unutar komponente
  const supabase = createClient();

  // 1. Pravilno izvlačenje varijabli iz tvog Contexta
  const { t, uiMode, euLang, nativeLang } = useLanguage(); 
  
  // 2. State za spremanje URL-a PDF-a i progress podataka
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [knownWords, setKnownWords] = useState<number>(0);
  const [completedScenarios, setCompletedScenarios] = useState<number>(0);
  const [practiceSessions, setPracticeSessions] = useState<number>(0);

  useEffect(() => {
    async function fetchProgress() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [wordsRes, scenariosRes, sessionsRes] = await Promise.all([
        supabase.from('word_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'known'),
        supabase.from('scenario_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
        supabase.from('user_test_results').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      setKnownWords(wordsRes.count ?? 0);
      setCompletedScenarios(scenariosRes.count ?? 0);
      setPracticeSessions(sessionsRes.count ?? 0);
    }

    fetchProgress();
  }, []);

  useEffect(() => {
    async function fetchManual() {
      // 3. Odredi točan kod jezika (npr. 'ne', 'ar', 'en') na temelju onoga što korisnik gleda
      let activeLangCode = "hr"; 
      if (uiMode === "eu") activeLangCode = euLang;
      if (uiMode === "native") activeLangCode = nativeLang;

      if (!activeLangCode) return;
      
      // 4. Traži u bazi koristeći maybeSingle() umjesto single() da izbjegnemo greške ako PDF-a nema
      const { data, error } = await supabase
        .from("manuals")
        .select("file_url")
        .eq("language_code", activeLangCode)
        .maybeSingle(); 

      if (!error && data) {
        setPdfUrl(data.file_url);
      } else {
        setPdfUrl(null); 
      }
    }

    fetchManual();
  }, [uiMode, euLang, nativeLang, supabase]); // Pokreni ponovo ako korisnik prebaci jezik

  // --- PRIJEVODI IZ BAZE ---
  const title = t("Opći jezik");
  const subtitle = t("Osnove hrvatskog jezika, pozdravi, brojevi i svakodnevna komunikacija.");

  const dict = t("Rječnik");
  const dictDesc = t("Pretraži stotine općih riječi uz pametne filtere.");
  const dictBtn = t("OTVORI RJEČNIK");

  const scen = t("Scenariji");
  const scenDesc = t("Nauči svakodnevne rečenice u trgovini, kod doktora i na ulici.");
  const scenBtn = t("OTVORI SCENARIJE");

  const prac = t("Vježba");
  const pracDesc = t("Testiraj naučene opće riječi kroz interaktivne kartice.");
  const pracBtn = t("ZAPOČNI VJEŽBU");

  const gram = t("Gramatika");
  const gramDesc = t("Nauči kako pravilno spajati riječi u rečenice.");
  const gramBtn = t("Otvori Gramatiku");

  // Prijevodi za PDF banner
  const pdfTitle = t("Preuzmi Priručnik");
  const pdfDesc = t("Besplatan PDF gramatički priručnik na tvom jeziku.");
  const pdfBtn = t("Preuzmi PDF");

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto min-h-screen flex flex-col animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="mb-6 md:mb-12 text-center md:text-left" style={{ background: 'rgba(10,30,60,0.65)', borderRadius: 16, padding: '1.5rem', color: 'white' }}>
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5 mb-3 md:mb-4 justify-center md:justify-start">
          <div className="bg-blue-600 p-3 md:p-4 rounded-2xl md:rounded-[1.5rem] text-white shadow-lg">
            <Globe2 size={24} className="md:hidden" /><Globe2 size={32} className="hidden md:block" />
          </div>
          <div>
            <h1 className="text-2xl md:text-5xl font-black tracking-tight leading-none" style={{ color: 'white' }}>
              {title.main}
            </h1>
            {!title.isOnlyHr && (
              <p className="text-xs md:text-sm font-black uppercase mt-1 tracking-widest italic opacity-80" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {title.sub}
              </p>
            )}
          </div>
        </div>

        <div className="font-medium text-sm md:text-lg max-w-2xl leading-tight block" style={{ color: 'rgba(255,255,255,0.7)' }}>
           <p>{subtitle.main}</p>
           {!subtitle.isOnlyHr && (
             <p className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
               {subtitle.sub}
             </p>
           )}
        </div>
      </div>

      {/* GLAVNE KARTICE - 2x2 grid */}
      <div style={{ background: 'rgba(10,30,60,0.45)', borderRadius: 16, padding: '1.5rem' }}>
      <div className="grid grid-cols-2 gap-3 md:gap-8">
        
        {/* RJEČNIK */}
        <Link href="/general/dictionary" className="group p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center h-full" style={{ background: 'rgba(201, 38, 38, 0.60)', borderLeft: '10px solid rgba(59,130,246,0.8)' }}>
          <div className="bg-blue-50 p-3 md:p-6 rounded-full text-blue-600 mb-3 md:mb-6 group-hover:scale-110 transition-transform shadow-inner">
            <BookOpen size={28} className="md:hidden" /><BookOpen size={48} className="hidden md:block" />
          </div>
          <h2 className="text-sm md:text-2xl font-black text-slate-800 mb-1">{dict.main}</h2>
          {!dict.isOnlyHr && <p className="text-[9px] md:text-[10px] font-bold text-blue-400 uppercase mb-2 md:mb-4 tracking-tighter italic">{dict.sub}</p>}
          <div className="text-slate-500 font-medium mb-3 md:mb-8 flex-1 text-[10px] md:text-base line-clamp-2 md:line-clamp-none block">
             <p>{dictDesc.main}</p>
             {!dictDesc.isOnlyHr && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase italic">{dictDesc.sub}</p>}
          </div>
          <div style={{ width: '100%', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Naučeno</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>{knownWords} riječi</span>
            </div>
            <div style={{ height: 3, background: 'rgba(0,0,0,0.06)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: '0%', background: '#3b82f6', borderRadius: 99 }} />
            </div>
          </div>
          <span className="w-full bg-blue-100 text-blue-700 font-black py-2 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {dictBtn.main}
          </span>
        </Link>

        {/* SCENARIJI */}
        <Link href="/general/scenarios" className="group p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center h-full" style={{ background: 'rgba(195, 235, 210, 0.85)', borderLeft: '10px solid rgba(34,197,94,0.8)' }}>
          <div className="bg-emerald-50 p-3 md:p-6 rounded-full text-emerald-600 mb-3 md:mb-6 group-hover:scale-110 transition-transform shadow-inner">
            <MessageSquare size={28} className="md:hidden" /><MessageSquare size={48} className="hidden md:block" />
          </div>
          <h2 className="text-sm md:text-2xl font-black text-white mb-1">{scen.main}</h2>
          {!scen.isOnlyHr && <p className="text-[9px] md:text-[10px] font-bold text-emerald-500 uppercase mb-2 md:mb-4 tracking-tighter italic">{scen.sub}</p>}
          <div className="text-slate-500 font-medium mb-3 md:mb-8 flex-1 text-[10px] md:text-base line-clamp-2 md:line-clamp-none block">
             <p>{scenDesc.main}</p>
             {!scenDesc.isOnlyHr && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase italic">{scenDesc.sub}</p>}
          </div>
          <div style={{ width: '100%', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Završeno</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>{completedScenarios} završeno</span>
            </div>
            <div style={{ height: 3, background: 'rgba(0,0,0,0.06)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: '0%', background: '#10b981', borderRadius: 99 }} />
            </div>
          </div>
          <span className="w-full bg-emerald-100 text-emerald-700 font-black py-2 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs uppercase tracking-wider group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            {scenBtn.main}
          </span>
        </Link>

        {/* GRAMATIKA */}
        <Link href="/general/grammar" className="group p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center h-full" style={{ background: 'rgba(255,255,255,0.90)', borderLeft: '10px solid rgba(168,85,247,0.8)' }}>
          <div className="bg-purple-50 p-3 md:p-6 rounded-full text-purple-600 mb-3 md:mb-6 group-hover:scale-110 transition-transform shadow-inner">
            <Puzzle size={28} className="md:hidden" /><Puzzle size={48} className="hidden md:block" />
          </div>
          <h2 className="text-sm md:text-2xl font-black text-slate-800 mb-1">{gram.main}</h2>
          {!gram.isOnlyHr && <p className="text-[9px] md:text-[10px] font-bold text-purple-400 uppercase mb-2 md:mb-4 tracking-tighter italic">{gram.sub}</p>}
          <div className="text-slate-500 font-medium mb-3 md:mb-8 flex-1 text-[10px] md:text-base line-clamp-2 md:line-clamp-none block">
             <p>{gramDesc.main}</p>
             {!gramDesc.isOnlyHr && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase italic">{gramDesc.sub}</p>}
          </div>
          <div style={{ width: '100%', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Lekcije</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#a855f7' }}>0 / 3</span>
            </div>
            <div style={{ height: 3, background: 'rgba(0,0,0,0.06)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: '0%', background: '#a855f7', borderRadius: 99 }} />
            </div>
          </div>
          <span className="w-full bg-purple-100 text-purple-700 font-black py-2 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs uppercase tracking-wider group-hover:bg-purple-600 group-hover:text-white transition-colors">
            {gramBtn.main}
          </span>
        </Link>

        {/* VJEŽBA — tamna kartica, bez border-left */}
        <Link href="/general/practice" className="group p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-800 shadow-lg hover:shadow-xl transition-all flex flex-col items-center text-center h-full" style={{ background: 'rgba(15,23,42,0.60)' }}>
          <div className="bg-white/10 p-3 md:p-6 rounded-full text-orange-400 mb-3 md:mb-6 group-hover:scale-110 transition-transform">
            <BrainCircuit size={28} className="md:hidden" /><BrainCircuit size={48} className="hidden md:block" />
          </div>
          <h2 className="text-sm md:text-2xl font-black text-white mb-1">{prac.main}</h2>
          {!prac.isOnlyHr && <p className="text-[9px] md:text-[10px] font-bold text-orange-400 uppercase mb-2 md:mb-4 tracking-tighter italic">{prac.sub}</p>}
          <div className="text-slate-300 font-medium mb-3 md:mb-8 flex-1 text-[10px] md:text-base line-clamp-2 md:line-clamp-none block">
             <p>{pracDesc.main}</p>
             {!pracDesc.isOnlyHr && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase italic">{pracDesc.sub}</p>}
          </div>
          <div style={{ width: '100%', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Sesije</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316' }}>{practiceSessions}</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: '0%', background: '#f97316', borderRadius: 99 }} />
            </div>
          </div>
          <span className="w-full bg-orange-500 text-white font-black py-2 md:py-4 rounded-xl md:rounded-2xl shadow-md group-hover:bg-orange-600 transition-colors text-[10px] md:text-xs uppercase tracking-wider">
            {pracBtn.main}
          </span>
        </Link>

      </div>
      </div>

      {/* PAMETNI GUMB ZA PDF */}
      {pdfUrl && (
        <a 
          href={pdfUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-8 md:mt-12 bg-gradient-to-r from-blue-600 to-purple-600 p-1 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group block"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-[2.3rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/20 text-white">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 p-5 rounded-full shadow-inner group-hover:scale-110 transition-transform">
                <FileDown size={40} className="text-white" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-black mb-1">{pdfTitle.main}</h3>
                <p className="text-blue-100 font-medium">
                  {pdfDesc.main}
                </p>
                {!pdfTitle.isOnlyHr && (
                  <p className="text-xs text-white/60 font-bold uppercase mt-2 tracking-widest">
                    {pdfTitle.sub}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full md:w-auto px-8 py-4 bg-white text-blue-700 font-black rounded-2xl text-sm uppercase tracking-wider text-center group-hover:bg-blue-50 transition-colors shadow-md">
              {pdfBtn.main}
            </div>
          </div>
        </a>
      )}

    </div>
  );
}