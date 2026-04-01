"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Flame,
  BookOpen,
  Zap,
  ChevronRight,
  MessageSquare,
  Star,
  BrainCircuit
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";
import { createClient } from "@/utils/supabase/client";
import DashboardSlideshowSection from "./DashboardSlideshowSection";

export default function DashboardClient({ job, profile }: { job: any, profile: any }) {
  const supabase = createClient();
  const { euLang, nativeLang, t, uiMode } = useLanguage();

  const [knownWords, setKnownWords] = useState<number>(0);
  const [completedScenarios, setCompletedScenarios] = useState<number>(0);

  useEffect(() => {
    async function fetchProgress() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [wordsRes, scenariosRes] = await Promise.all([
        supabase.from('word_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'known'),
        supabase.from('scenario_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
      ]);

      setKnownWords(wordsRes.count ?? 0);
      setCompletedScenarios(scenariosRes.count ?? 0);
    }

    fetchProgress();
  }, []);

  // --- PRIJEVODI ---
  const displayName = profile?.full_name?.split(' ')[0] || "Radniče";
  const greeting = t(`Bok, ${displayName}! 👋`);
  const greetingSub = t("Tvoj put do majstora hrvatskog jezika se nastavlja.");
  const streak = t("Niz");
  const days = t("dana");
  const points = t("Bodovi");
  const learnedLabel = t("Naučeno");

  const continueLabel = t("Nastavi gdje si stao");
  const dictLabel = t("Opći rječnik");
  const scenLabel = t("Scenariji");
  const dictSubLabel = t("naučeno");
  const scenSubLabel = t("završeno");

  const quickLabel = t("Brzi pristup");
  const professionPrefix = t("Tvoja struka");
  const practiceLabel = t("Vježba");
  const practiceDesc = t("Kartice i kvizovi");

  const testsTitle = t("Dostupni testovi");
  const seeAll = t("Vidi sve");

  const goalTitle = t("Dnevni cilj");
  const goalDesc = t("Još samo 5 riječi do današnjeg cilja!");
  const smashBtn = t("Sruši cilj!");

  // --- NAZIV ZANIMANJA ---
  const getJobName = () => {
    if (!job) return "";
    if (uiMode === 'hr') return job.name_hr;
    const trans = job.translations || {};
    if (uiMode === 'native' && trans[nativeLang]) return trans[nativeLang];
    if (uiMode === 'eu' && trans[euLang]) return trans[euLang];
    return job.name_hr;
  };
  const jobName = getJobName();

  const availableTests = [
    { titleHr: "Osnove gradilišta", xp: "+50 XP", color: "bg-emerald-50 text-emerald-600" },
    { titleHr: "Komunikacija s kolegama", xp: "+80 XP", color: "bg-blue-50 text-blue-600" },
  ];

  // Avatar
  const avatarUrl = profile?.avatar_url || null;
  const initials = (profile?.full_name || "?").split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const streakDays = profile?.streak_days || 0;
  const xpPoints = profile?.xp_points || 0;

  return (
    <div className="w-full flex flex-col animate-in fade-in duration-500">

      {/* ═══════════════════════════════════════════
          1. TAMNI HEADER
      ═══════════════════════════════════════════ */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' }} className="px-4 md:px-10 pt-8 pb-10">
        <div className="w-full">

          {/* Pozdrav + avatar */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
                {greeting.main}
              </h1>
              {!greeting.isOnlyHr && (
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mt-0.5">{greeting.sub}</p>
              )}
              <div className="text-slate-400 font-medium text-sm md:text-base mt-2">
                <p>{greetingSub.main}</p>
                {!greetingSub.isOnlyHr && (
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{greetingSub.sub}</p>
                )}
              </div>
            </div>
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 object-cover shadow-lg" style={{ borderRadius: '50%' }} />
            ) : (
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg shadow-emerald-500/30">
                {initials}
              </div>
            )}
          </div>

          {/* 3 stat kartice */}
          <div className="flex gap-2 md:gap-3">
            {/* Streak */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 md:p-5 flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className="bg-orange-500/20 p-1.5 md:p-3 rounded-xl text-orange-400 flex-shrink-0">
                <Flame size={16} fill="currentColor" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider truncate">NIZ</p>
                <p className="text-base md:text-2xl font-black text-orange-400 leading-none truncate">
                  {streakDays} <span className="text-[10px] md:text-sm font-bold">{days.main}</span>
                </p>
              </div>
            </div>

            {/* XP */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 md:p-5 flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className="bg-blue-500/20 p-1.5 md:p-3 rounded-xl text-blue-400 flex-shrink-0">
                <Star size={16} fill="currentColor" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider truncate">XP</p>
                <p className="text-base md:text-2xl font-black text-blue-400 leading-none truncate">
                  {xpPoints.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Naučeno */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 md:p-5 flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className="bg-emerald-500/20 p-1.5 md:p-3 rounded-xl text-emerald-400 flex-shrink-0">
                <BookOpen size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider truncate">RIJEČI</p>
                <p className="text-base md:text-2xl font-black text-emerald-400 leading-none truncate">
                  {knownWords}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════
          CONTENT ISPOD HEADERA
      ═══════════════════════════════════════════ */}
      <div className="flex-1 bg-slate-50 px-4 md:px-10 py-8">
        <div className="w-full space-y-8">

          {/* ─────────────────────────────────────────
              2. NASTAVI GDJE SI STAO
          ───────────────────────────────────────── */}
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{continueLabel.main}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Opći rječnik */}
              <Link href="/general/dictionary" className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4" style={{ borderLeft: '3px solid #3b82f6' }}>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm md:text-base">{dictLabel.main}</p>
                    {!dictLabel.isOnlyHr && <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">{dictLabel.sub}</p>}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dictSubLabel.main}</span>
                    <span className="text-[10px] font-black text-blue-600">{knownWords} riječi</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${Math.min((knownWords / 100) * 100, 100)}%`, background: '#3b82f6', borderRadius: 99, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              </Link>

              {/* Scenariji */}
              <Link href="/general/scenarios" className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4" style={{ borderLeft: '3px solid #10b981' }}>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm md:text-base">{scenLabel.main}</p>
                    {!scenLabel.isOnlyHr && <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{scenLabel.sub}</p>}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{scenSubLabel.main}</span>
                    <span className="text-[10px] font-black text-emerald-600">{completedScenarios} scenarija</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${Math.min((completedScenarios / 20) * 100, 100)}%`, background: '#10b981', borderRadius: 99, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              </Link>

            </div>
          </div>

          {/* ─────────────────────────────────────────
              3. BRZI PRISTUP
          ───────────────────────────────────────── */}
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{quickLabel.main}</h2>
            <div className="grid grid-cols-2 gap-4">

              {/* Stručni */}
              <Link href={`/learn/${job?.id || ''}`} className="group relative overflow-hidden bg-slate-900 rounded-2xl p-5 text-white shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 flex flex-col gap-3 min-h-[130px]">
                <div className="bg-orange-500 self-start p-2 rounded-xl shadow-lg shadow-orange-500/40">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{professionPrefix.main}</p>
                  <p className="font-black text-white text-sm md:text-base leading-tight mt-0.5">{jobName || job?.name_hr}</p>
                </div>
                <ChevronRight size={16} className="absolute bottom-4 right-4 text-slate-600 group-hover:text-orange-400 transition-colors" />
              </Link>

              {/* Vježba */}
              <Link href="/general/practice" className="group relative overflow-hidden bg-emerald-600 rounded-2xl p-5 text-white shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 flex flex-col gap-3 min-h-[130px]">
                <div className="bg-white/20 self-start p-2 rounded-xl">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <p className="font-black text-white text-sm md:text-base leading-tight">{practiceLabel.main}</p>
                  {!practiceLabel.isOnlyHr && <p className="text-[9px] font-black text-emerald-200 uppercase tracking-widest mt-0.5">{practiceLabel.sub}</p>}
                  <p className="text-emerald-100 text-xs mt-1">{practiceDesc.main}</p>
                </div>
                <ChevronRight size={16} className="absolute bottom-4 right-4 text-emerald-400 group-hover:text-white transition-colors" />
              </Link>

            </div>
          </div>

          {/* ─────────────────────────────────────────
              4. CROATIA SLIDESHOW
          ───────────────────────────────────────── */}
          <DashboardSlideshowSection language={nativeLang || "en"} />

          {/* ─────────────────────────────────────────
              5. TESTOVI + DNEVNI CILJ
          ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Testovi */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-black text-slate-800 text-base">{testsTitle.main}</h3>
                  {!testsTitle.isOnlyHr && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{testsTitle.sub}</p>}
                </div>
                <Link href="/quizzes" className="text-xs font-black text-blue-600 hover:underline">{seeAll.main} →</Link>
              </div>
              <div className="space-y-3">
                {availableTests.map((test, i) => {
                  const testTrans = t(test.titleHr);
                  return (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${test.color}`}>
                          <MessageSquare size={18} />
                        </div>
                        <div>
                          <p className="font-black text-slate-700 text-sm">{testTrans.main}</p>
                          {!testTrans.isOnlyHr && <p className="text-[9px] font-bold text-slate-400 uppercase">{testTrans.sub}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400">{test.xp}</span>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-600" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dnevni cilj */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white flex flex-col gap-5 shadow-lg shadow-indigo-200">
              <div>
                <h3 className="font-black text-lg">{goalTitle.main}</h3>
                {!goalTitle.isOnlyHr && <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">{goalTitle.sub}</p>}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-2">
                  <p className="text-indigo-100 text-sm font-medium">{goalDesc.main}</p>
                  <span className="text-white font-black text-sm ml-3 flex-shrink-0">75%</span>
                </div>
                {!goalDesc.isOnlyHr && <p className="text-[9px] uppercase font-bold text-indigo-300 mb-2">{goalDesc.sub}</p>}
                <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: '75%', background: '#ffffff', borderRadius: 99 }} />
                </div>
              </div>

              <Link href="/general/dictionary" className="w-full bg-white text-indigo-600 font-black py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-md text-sm text-center block">
                {smashBtn.main}
              </Link>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
