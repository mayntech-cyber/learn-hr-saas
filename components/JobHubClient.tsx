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

      // Prvo dohvati word_id-eve za ovo zanimanje
      const { data: jobWords } = await supabase
        .from('dictionary')
        .select('id')
        .eq('job_id', job.id);

      const jobWordIds = (jobWords || []).map((w: any) => w.id);

      const [wordsRes, scenariosRes, sessionsRes] = await Promise.all([
        jobWordIds.length > 0
          ? supabase.from('word_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).in('word_id', jobWordIds).eq('status', 'known')
          : Promise.resolve({ count: 0 }),
        supabase.from('scenario_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
        supabase.from('user_test_results').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
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
  const dictBtn = t("OTVORI RJEČNIK");

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
    <div className="p-2 md:p-10 w-full min-h-screen flex flex-col animate-in fade-in duration-500">

      {/* --- DVOJEZIČNI HEADER --- */}
      <div className="mb-6 md:mb-12" style={{ background: 'rgba(10,30,60,0.65)', borderRadius: 16, padding: '1.5rem', color: 'white' }}>
        <Link
          href={`/professional/${job?.category_id || ''}`}
          className="group inline-flex flex-col mb-6"
        >
          <div className="flex items-center gap-2 text-sm font-bold transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <ArrowLeft size={16} />
            <span>{back.main}</span>
          </div>
          {!back.isOnlyHr && (
            <span className="text-[10px] font-bold ml-6 uppercase tracking-tighter italic" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {back.sub}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl text-white shadow-md" style={{ background: '#f59e0b' }}>
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none" style={{ color: 'white' }}>
              {jobTitle.main}
            </h1>
            {jobTitle.sub && (
              <p className="text-[11px] font-black uppercase mt-1 tracking-widest italic opacity-80" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {jobTitle.sub}
              </p>
            )}

            <div className="font-medium mt-3 leading-tight" style={{ color: 'rgba(255,255,255,0.7)' }}>
               <p>{subtitle.main}</p>
               {!subtitle.isOnlyHr && (
                 <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                   {subtitle.sub}
                 </p>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* --- GLAVNI IZBORNIK --- */}
      <div className="px-0 md:px-6" style={{ background: 'rgba(10,30,60,0.45)', borderRadius: 16, paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8">

        {/* 1. RJEČNIK — blue */}
        <Link href={`/learn/${job?.id}/dictionary`} className="group relative flex flex-row md:flex-col items-center md:items-center text-left md:text-center h-20 md:h-auto p-3 md:p-8 rounded-xl md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex-shrink-0 bg-white/15 flex items-center justify-center rounded-full mr-3 md:mr-0 md:mb-6 group-hover:scale-110 transition-transform shadow-inner w-10 h-10 md:w-auto md:h-auto md:p-6">
            <BookOpen size={20} style={{ color: '#f59e0b' }} className="md:hidden" />
            <BookOpen size={48} style={{ color: '#f59e0b' }} className="hidden md:block" />
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
                <div style={{ height: '100%', width: '0%', background: '#f59e0b', borderRadius: 99 }} />
              </div>
            </div>
            <span className="hidden md:block w-full text-white font-black py-4 rounded-2xl text-xs uppercase tracking-wider text-center transition-colors mt-2" style={{ background: '#f59e0b' }}>
              {dictBtn.main}
            </span>
          </div>
          <div className="md:hidden flex-shrink-0 ml-2" style={{ minWidth: '80px', maxWidth: '80px' }}>
            <span className="w-full block text-white font-black py-1 rounded-lg text-[8px] uppercase tracking-wider transition-colors whitespace-nowrap text-center" style={{ background: '#f59e0b', paddingLeft: '8px', paddingRight: '8px' }}>
              OTVORI
            </span>
          </div>
        </Link>

        {/* 2. SCENARIJI — green */}
        <Link href={`/learn/${job?.id}/scenarios`} className="group relative flex flex-row md:flex-col items-center md:items-center text-left md:text-center h-20 md:h-auto p-3 md:p-8 rounded-xl md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex-shrink-0 bg-white/15 flex items-center justify-center rounded-full mr-3 md:mr-0 md:mb-6 group-hover:scale-110 transition-transform w-10 h-10 md:w-auto md:h-auto md:p-6">
            <MessageSquare size={20} style={{ color: '#0891b2' }} className="md:hidden" />
            <MessageSquare size={48} style={{ color: '#0891b2' }} className="hidden md:block" />
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
                <div style={{ height: '100%', width: '0%', background: '#0891b2', borderRadius: 99 }} />
              </div>
            </div>
            <span className="hidden md:block w-full text-white font-black py-4 rounded-2xl text-xs uppercase tracking-wider text-center transition-colors mt-2" style={{ background: '#0891b2' }}>
              {scenBtn.main}
            </span>
          </div>
          <div className="md:hidden flex-shrink-0 ml-2" style={{ minWidth: '80px', maxWidth: '80px' }}>
            <span className="w-full block text-white font-black py-1 rounded-lg text-[8px] uppercase tracking-wider transition-colors whitespace-nowrap text-center" style={{ background: '#0891b2', paddingLeft: '8px', paddingRight: '8px' }}>
              OTVORI
            </span>
          </div>
        </Link>

        {/* 3. VJEŽBA — orange */}
        <Link href={`/learn/${job?.id}/practice`} className="group relative flex flex-row md:flex-col items-center md:items-center text-left md:text-center h-20 md:h-auto p-3 md:p-8 rounded-xl md:rounded-[2.5rem] shadow-lg hover:shadow-xl transition-all" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex-shrink-0 bg-white/15 flex items-center justify-center rounded-full mr-3 md:mr-0 md:mb-6 group-hover:scale-110 transition-transform w-10 h-10 md:w-auto md:h-auto md:p-6">
            <BrainCircuit size={20} style={{ color: '#dc2626' }} className="md:hidden" />
            <BrainCircuit size={48} style={{ color: '#dc2626' }} className="hidden md:block" />
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
                <div style={{ height: '100%', width: '0%', background: '#dc2626', borderRadius: 99 }} />
              </div>
            </div>
            <span className="hidden md:block w-full text-white font-black py-4 rounded-2xl shadow-md transition-colors text-xs uppercase tracking-wider text-center mt-2" style={{ background: '#dc2626' }}>
              {pracBtn.main}
            </span>
          </div>
          <div className="md:hidden flex-shrink-0 ml-2" style={{ minWidth: '80px', maxWidth: '80px' }}>
            <span className="w-full block text-white font-black py-1 rounded-lg text-[8px] uppercase tracking-wider transition-colors whitespace-nowrap text-center" style={{ background: '#dc2626', paddingLeft: '8px', paddingRight: '8px' }}>
              NASTAVI
            </span>
          </div>
        </Link>

      </div>
      </div>
    </div>
  );
}