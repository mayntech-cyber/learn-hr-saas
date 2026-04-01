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
    <div className="p-2 md:p-10 w-full min-h-screen flex flex-col animate-in fade-in duration-500">
      
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

      {/* GLAVNE KARTICE - single column mobile / 2x2 grid desktop */}
      <div className="px-0 md:px-6" style={{ background: 'rgba(10,30,60,0.45)', borderRadius: 16, paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-8">

        {/* RJEČNIK — blue */}
        <Link href="/general/dictionary" className="group relative flex flex-row md:flex-col items-center md:items-center text-left md:text-center h-20 md:h-auto p-3 md:p-8 rounded-xl md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex-shrink-0 bg-white/15 flex items-center justify-center rounded-full mr-3 md:mr-0 md:mb-6 group-hover:scale-110 transition-transform shadow-inner w-10 h-10 md:w-auto md:h-auto md:p-6">
            <BookOpen size={20} style={{ color: '#3b82f6' }} className="md:hidden" />
            <BookOpen size={48} style={{ color: '#3b82f6' }} className="hidden md:block" />
          </div>
          <div className="flex-1 min-w-0 md:w-full flex flex-col">
            <h2 className="text-xs md:text-2xl font-black text-white mb-0.5 md:mb-1">{dict.main}</h2>
            {!dict.isOnlyHr && <p className="text-[8px] md:text-[10px] font-bold text-white/70 uppercase mb-0.5 md:mb-4 tracking-tighter italic">{dict.sub}</p>}
            <div className="hidden md:block text-white/80 font-medium mb-3 md:mb-8 flex-1 text-base">
              <p>{dictDesc.main}</p>
              {!dictDesc.isOnlyHr && <p className="text-[10px] text-white/60 font-bold mt-1 uppercase italic">{dictDesc.sub}</p>}
            </div>
            <div style={{ width: '100%', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Naučeno</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{knownWords} riječi</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 99 }}>
                <div style={{ height: '100%', width: '0%', background: '#3b82f6', borderRadius: 99 }} />
              </div>
            </div>
            <span className="hidden md:block w-full bg-blue-500 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-wider text-center group-hover:bg-blue-600 transition-colors mt-2">
              {dictBtn.main}
            </span>
          </div>
          <div className="md:hidden flex-shrink-0 ml-2" style={{ minWidth: '80px', maxWidth: '80px' }}>
            <span className="w-full block bg-blue-500 text-white font-black py-1 rounded-lg text-[8px] uppercase tracking-wider group-hover:bg-blue-600 transition-colors whitespace-nowrap text-center" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
              OTVORI
            </span>
          </div>
        </Link>

        {/* SCENARIJI — green */}
        <Link href="/general/scenarios" className="group relative flex flex-row md:flex-col items-center md:items-center text-left md:text-center h-20 md:h-auto p-3 md:p-8 rounded-xl md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex-shrink-0 bg-white/15 flex items-center justify-center rounded-full mr-3 md:mr-0 md:mb-6 group-hover:scale-110 transition-transform w-10 h-10 md:w-auto md:h-auto md:p-6">
            <MessageSquare size={20} style={{ color: '#16a34a' }} className="md:hidden" />
            <MessageSquare size={48} style={{ color: '#16a34a' }} className="hidden md:block" />
          </div>
          <div className="flex-1 min-w-0 md:w-full flex flex-col">
            <h2 className="text-xs md:text-2xl font-black text-white mb-0.5 md:mb-1">{scen.main}</h2>
            {!scen.isOnlyHr && <p className="text-[8px] md:text-[10px] font-bold text-white/70 uppercase mb-0.5 md:mb-4 tracking-tighter italic">{scen.sub}</p>}
            <div className="hidden md:block text-white/80 font-medium mb-3 md:mb-8 flex-1 text-base">
              <p>{scenDesc.main}</p>
              {!scenDesc.isOnlyHr && <p className="text-[10px] text-white/60 font-bold mt-1 uppercase italic">{scenDesc.sub}</p>}
            </div>
            <div style={{ width: '100%', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Završeno</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{completedScenarios} završeno</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 99 }}>
                <div style={{ height: '100%', width: '0%', background: '#16a34a', borderRadius: 99 }} />
              </div>
            </div>
            <span className="hidden md:block w-full bg-green-700 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-wider text-center group-hover:bg-green-800 transition-colors mt-2">
              {scenBtn.main}
            </span>
          </div>
          <div className="md:hidden flex-shrink-0 ml-2" style={{ minWidth: '80px', maxWidth: '80px' }}>
            <span className="w-full block bg-green-700 text-white font-black py-1 rounded-lg text-[8px] uppercase tracking-wider group-hover:bg-green-800 transition-colors whitespace-nowrap text-center" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
              OTVORI
            </span>
          </div>
        </Link>

        {/* GRAMATIKA — purple */}
        <Link href="/general/grammar" className="group relative flex flex-row md:flex-col items-center md:items-center text-left md:text-center h-20 md:h-auto p-3 md:p-8 rounded-xl md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex-shrink-0 bg-white/15 flex items-center justify-center rounded-full mr-3 md:mr-0 md:mb-6 group-hover:scale-110 transition-transform w-10 h-10 md:w-auto md:h-auto md:p-6">
            <Puzzle size={20} style={{ color: '#7c3aed' }} className="md:hidden" />
            <Puzzle size={48} style={{ color: '#7c3aed' }} className="hidden md:block" />
          </div>
          <div className="flex-1 min-w-0 md:w-full flex flex-col">
            <h2 className="text-xs md:text-2xl font-black text-white mb-0.5 md:mb-1">{gram.main}</h2>
            {!gram.isOnlyHr && <p className="text-[8px] md:text-[10px] font-bold text-white/70 uppercase mb-0.5 md:mb-4 tracking-tighter italic">{gram.sub}</p>}
            <div className="hidden md:block text-white/80 font-medium mb-3 md:mb-8 flex-1 text-base">
              <p>{gramDesc.main}</p>
              {!gramDesc.isOnlyHr && <p className="text-[10px] text-white/60 font-bold mt-1 uppercase italic">{gramDesc.sub}</p>}
            </div>
            <div style={{ width: '100%', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Lekcije</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>0 / 3</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 99 }}>
                <div style={{ height: '100%', width: '0%', background: '#7c3aed', borderRadius: 99 }} />
              </div>
            </div>
            <span className="hidden md:block w-full bg-violet-700 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-wider text-center group-hover:bg-violet-800 transition-colors mt-2">
              {gramBtn.main}
            </span>
          </div>
          <div className="md:hidden flex-shrink-0 ml-2" style={{ minWidth: '80px', maxWidth: '80px' }}>
            <span className="w-full block bg-violet-700 text-white font-black py-1 rounded-lg text-[8px] uppercase tracking-wider group-hover:bg-violet-800 transition-colors whitespace-nowrap text-center" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
              OTVORI
            </span>
          </div>
        </Link>

        {/* VJEŽBA — orange */}
        <Link href="/general/practice" className="group relative flex flex-row md:flex-col items-center md:items-center text-left md:text-center h-20 md:h-auto p-3 md:p-8 rounded-xl md:rounded-[2.5rem] shadow-lg hover:shadow-xl transition-all" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex-shrink-0 bg-white/15 flex items-center justify-center rounded-full mr-3 md:mr-0 md:mb-6 group-hover:scale-110 transition-transform w-10 h-10 md:w-auto md:h-auto md:p-6">
            <BrainCircuit size={20} style={{ color: '#f97316' }} className="md:hidden" />
            <BrainCircuit size={48} style={{ color: '#f97316' }} className="hidden md:block" />
          </div>
          <div className="flex-1 min-w-0 md:w-full flex flex-col">
            <h2 className="text-xs md:text-2xl font-black text-white mb-0.5 md:mb-1">{prac.main}</h2>
            {!prac.isOnlyHr && <p className="text-[8px] md:text-[10px] font-bold text-white/70 uppercase mb-0.5 md:mb-4 tracking-tighter italic">{prac.sub}</p>}
            <div className="hidden md:block text-white/80 font-medium mb-3 md:mb-8 flex-1 text-base">
              <p>{pracDesc.main}</p>
              {!pracDesc.isOnlyHr && <p className="text-[10px] text-white/60 font-bold mt-1 uppercase italic">{pracDesc.sub}</p>}
            </div>
            <div style={{ width: '100%', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Sesije</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{practiceSessions}</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 99 }}>
                <div style={{ height: '100%', width: '0%', background: '#f97316', borderRadius: 99 }} />
              </div>
            </div>
            <span className="hidden md:block w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-md group-hover:bg-orange-600 transition-colors text-xs uppercase tracking-wider text-center mt-2">
              {pracBtn.main}
            </span>
          </div>
          <div className="md:hidden flex-shrink-0 ml-2" style={{ minWidth: '80px', maxWidth: '80px' }}>
            <span className="w-full block bg-orange-500 text-white font-black py-1 rounded-lg text-[8px] uppercase tracking-wider group-hover:bg-orange-600 transition-colors whitespace-nowrap text-center" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
              NASTAVI
            </span>
          </div>
        </Link>

      </div>
      </div>

      {/* PAMETNI GUMB ZA PDF */}
      {pdfUrl && (
        <a 
          href={pdfUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-8 md:mt-12 bg-gradient-to-r from-blue-600 to-purple-600 p-1 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group block -mx-2 md:mx-0"
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