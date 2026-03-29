"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, MessageSquare, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { createClient } from "@/utils/supabase/client";

export default function JobHubClient({ job }: { job: any }) {
  const supabase = createClient();
  const { euLang, nativeLang, t, uiMode } = useLanguage();

  const [knownWords, setKnownWords] = useState<number>(0);
  const [completedScenarios, setCompletedScenarios] = useState<number>(0);
  const [practiceSessions, setPracticeSessions] = useState<number>(0);

  useEffect(() => {
    if (!job?.id) return;

    async function fetchProgress() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [wordsRes, scenariosRes, sessionsRes] = await Promise.all([
        supabase.from('word_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('job_id', job.id).eq('status', 'known'),
        supabase.from('scenario_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('job_id', job.id).eq('status', 'completed'),
        supabase.from('user_test_results').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('job_id', job.id),
      ]);

      setKnownWords(wordsRes.count ?? 0);
      setCompletedScenarios(scenariosRes.count ?? 0);
      setPracticeSessions(sessionsRes.count ?? 0);
    }

    fetchProgress();
  }, [job?.id]);

  // 1. STATIČNI PRIJEVODI IZ BAZE (ui_translations)
  const back = t("Nazad na zanimanja");
  const subtitle = t("Odaberi kako želiš učiti danas.");
  
  const dict = t("Rječnik");
  const dictDesc = t("Pregledaj sve riječi, alate i materijale sa slikama i zvukom.");
  const dictBtn = t("OTVORI RJEČNIK"); // Velika slova za gumbe!

  const scen = t("Scenariji");
  const scenDesc = t("Nauči korisne rečenice i dijaloge za svakodnevni rad na poslu.");
  const scenBtn = t("OTVORI SCENARIJE");

  const prac = t("Vježba");
  const pracDesc = t("Testiraj svoje znanje kroz interaktivne kartice. Skriveni prijevodi!");
  const pracBtn = t("ZAPOČNI VJEŽBU");

  // 2. DINAMIČNI PRIJEVOD NAZIVA ZANIMANJA (Iz tablice 'jobs')
  const getJobTitle = () => {
    if (!job) return { main: "Učenje", sub: "" };
    if (uiMode === 'hr') return { main: job.name_hr, sub: "" };
    
    const trans = job.translations || {};
    if (uiMode === 'native' && trans[nativeLang]) {
      return { main: trans[nativeLang], sub: job.name_hr };
    }
    if (uiMode === 'eu' && trans[euLang]) {
      return { main: trans[euLang], sub: job.name_hr };
    }
    return { main: job.name_hr, sub: "" };
  };

  const jobTitle = getJobTitle();

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto min-h-screen flex flex-col animate-in fade-in duration-500">
      
      {/* --- DVOJEZIČNI HEADER --- */}
      <div className="mb-10">
        <Link 
          href={`/professional/${job?.category_id || ''}`} 
          className="group inline-flex flex-col mb-6"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
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
          <div className="bg-slate-800 p-3 rounded-2xl text-white shadow-md">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-none">
              {jobTitle.main}
            </h1>
            {jobTitle.sub && (
              <p className="text-[11px] font-black text-slate-400 uppercase mt-1 tracking-widest italic opacity-80">
                {jobTitle.sub}
              </p>
            )}
            
            <div className="text-slate-500 font-medium mt-3 leading-tight">
               <p>{subtitle.main}</p>
               {!subtitle.isOnlyHr && (
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                   {subtitle.sub}
                 </p>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* --- GLAVNI IZBORNIK --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        
        {/* 1. RJEČNIK */}
        <Link href={`/learn/${job?.id}/dictionary`} className="group bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center" style={{ borderLeft: '3px solid #3b82f6' }}>
          <div className="bg-blue-50 p-3 md:p-6 rounded-full text-blue-600 mb-3 md:mb-6 group-hover:scale-110 transition-transform">
            <BookOpen size={28} className="md:hidden" /><BookOpen size={48} className="hidden md:block" />
          </div>
          <h2 className="text-sm md:text-2xl font-black text-slate-800">{dict.main}</h2>
          {!dict.isOnlyHr && <p className="hidden md:block text-[10px] font-bold text-blue-400 uppercase mb-2 tracking-tighter italic">{dict.sub}</p>}

          <div className="text-slate-500 font-medium mb-3 flex-1 text-sm">
             <p>{dictDesc.main}</p>
             {!dictDesc.isOnlyHr && <p className="hidden md:block text-[10px] text-slate-400 font-bold mt-1 uppercase italic">{dictDesc.sub}</p>}
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
          <span className="w-full bg-blue-100 text-blue-700 font-black py-2 md:py-3 rounded-xl text-[10px] md:text-xs uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {dictBtn.main}
          </span>
        </Link>

        {/* 2. SCENARIJI */}
        <Link href={`/learn/${job?.id}/scenarios`} className="group bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center" style={{ borderLeft: '3px solid #10b981' }}>
          <div className="bg-emerald-50 p-3 md:p-6 rounded-full text-emerald-600 mb-3 md:mb-6 group-hover:scale-110 transition-transform">
            <MessageSquare size={28} className="md:hidden" /><MessageSquare size={48} className="hidden md:block" />
          </div>
          <h2 className="text-sm md:text-2xl font-black text-slate-800">{scen.main}</h2>
          {!scen.isOnlyHr && <p className="hidden md:block text-[10px] font-bold text-emerald-500 uppercase mb-2 tracking-tighter italic">{scen.sub}</p>}

          <div className="text-slate-500 font-medium mb-3 flex-1 text-sm">
             <p>{scenDesc.main}</p>
             {!scenDesc.isOnlyHr && <p className="hidden md:block text-[10px] text-slate-400 font-bold mt-1 uppercase italic">{scenDesc.sub}</p>}
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
          <span className="w-full bg-emerald-100 text-emerald-700 font-black py-2 md:py-3 rounded-xl text-[10px] md:text-xs uppercase tracking-wider group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            {scenBtn.main}
          </span>
        </Link>

        {/* 3. VJEŽBA */}
        <Link href={`/learn/${job?.id}/practice`} className="group bg-slate-900 p-4 md:p-8 rounded-2xl md:rounded-3xl border border-slate-800 shadow-lg hover:shadow-xl transition-all flex flex-col items-center text-center">
          <div className="bg-white/10 p-3 md:p-6 rounded-full text-orange-400 mb-3 md:mb-6 group-hover:scale-110 transition-transform">
            <BrainCircuit size={28} className="md:hidden" /><BrainCircuit size={48} className="hidden md:block" />
          </div>
          <h2 className="text-sm md:text-2xl font-black text-white">{prac.main}</h2>
          {!prac.isOnlyHr && <p className="hidden md:block text-[10px] font-bold text-orange-400 uppercase mb-2 tracking-tighter italic">{prac.sub}</p>}

          <div className="text-slate-300 font-medium mb-3 flex-1 text-sm">
             <p>{pracDesc.main}</p>
             {!pracDesc.isOnlyHr && <p className="hidden md:block text-[10px] text-slate-400 font-bold mt-1 uppercase italic">{pracDesc.sub}</p>}
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
          <span className="w-full bg-orange-500 text-white font-black py-2 md:py-3 rounded-xl shadow-md group-hover:bg-orange-600 transition-colors text-[10px] md:text-xs uppercase tracking-wider">
            {pracBtn.main}
          </span>
        </Link>

      </div>
    </div>
  );
}