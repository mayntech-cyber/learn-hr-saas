"use client";

import { 
  Trophy, 
  Flame, 
  BookOpen, 
  Zap, 
  ChevronRight, 
  LayoutGrid, 
  MessageSquare,
  Star
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";

export default function DashboardClient({ job }: { job: any }) {
  const { euLang, nativeLang, t, uiMode } = useLanguage();

  // --- STATIČNI PRIJEVODI ---
  const greeting = t("Bok, Radniče! 👋");
  const greetingSub = t("Tvoj put do majstora hrvatskog jezika se nastavlja.");
  const streak = t("Dnevni niz");
  const days = t("dana");
  const points = t("Bodovi");

  const generalTitle = t("Opći jezik");
  const generalDesc = t("Osnove za svakodnevni život: trgovina, pozdravi i hitne situacije.");
  const continueBtn = t("Nastavi učiti");

  const professionPrefix = t("Tvoja struka");
  const professionDesc = t("Alati, materijali i sigurnost na radnom mjestu.");
  const enterBtn = t("Uđi na gradilište");

  const testsTitle = t("Dostupni testovi");
  const seeAll = t("Vidi sve");

  const goalTitle = t("Dnevni cilj");
  const goalDesc = t("Još samo 5 riječi do današnjeg cilja!");
  const smashBtn = t("Sruši cilj!");

  // --- DINAMIČNI NAZIV ZANIMANJA ---
  const getJobName = () => {
    if (!job) return "";
    if (uiMode === 'hr') return job.name_hr;
    
    const trans = job.translations || {};
    if (uiMode === 'native' && trans[nativeLang]) return trans[nativeLang];
    if (uiMode === 'eu' && trans[euLang]) return trans[euLang];
    
    return job.name_hr;
  };

  const jobName = getJobName();

  // Simulirani testovi (Kasnije ovo možeš vući iz baze)
  const availableTests = [
    { titleHr: "Osnove gradilišta", xp: "+50 XP", color: "bg-emerald-50 text-emerald-600" },
    { titleHr: "Komunikacija s kolegama", xp: "+80 XP", color: "bg-blue-50 text-blue-600" },
    { titleHr: "Sigurnost na radu", xp: "+100 XP", color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto min-h-screen space-y-10 animate-in fade-in duration-700">
      
      {/* WELCOME HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
            {greeting.main}
          </h1>
          {!greeting.isOnlyHr && <p className="text-xs font-black text-slate-400 uppercase mt-1 tracking-widest">{greeting.sub}</p>}
          
          <div className="text-slate-500 text-lg font-medium mt-2">
             <p>{greetingSub.main}</p>
             {!greetingSub.isOnlyHr && <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{greetingSub.sub}</p>}
          </div>
        </div>
        
        {/* QUICK STATS BOX */}
        <div className="flex gap-3">
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-3xl flex items-center gap-3 shadow-sm">
            <div className="bg-orange-500 p-2 rounded-2xl text-white">
              <Flame size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-black text-orange-800 uppercase tracking-wider">{streak.main}</p>
              <p className="text-xl font-black text-orange-600 flex items-baseline gap-1">
                 5 <span className="text-sm">{days.main}</span>
              </p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-3xl flex items-center gap-3 shadow-sm">
            <div className="bg-blue-500 p-2 rounded-2xl text-white">
              <Star size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-800 uppercase tracking-wider">{points.main}</p>
              <p className="text-xl font-black text-blue-600">1,250</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN MODULES - VELIKE KARTICE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* OPĆI JEZIK - PLAVA KARTICA */}
        <Link href="/general" className="group relative overflow-hidden bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl hover:shadow-blue-200 transition-all hover:-translate-y-1">
          <div className="relative z-10 flex flex-col h-full">
            <div className="bg-white/20 self-start p-3 rounded-2xl mb-6 backdrop-blur-md">
              <BookOpen size={32} />
            </div>
            <h2 className="text-3xl font-black mb-1">{generalTitle.main}</h2>
            {!generalTitle.isOnlyHr && <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-2 opacity-80">{generalTitle.sub}</p>}
            
            <div className="text-blue-100 font-medium text-lg max-w-xs mb-8">
              <p>{generalDesc.main}</p>
            </div>
            <div className="mt-auto flex items-center gap-2 font-black bg-white text-blue-600 self-start px-6 py-3 rounded-2xl group-hover:gap-4 transition-all">
              {continueBtn.main} <ChevronRight size={20} />
            </div>
          </div>
          <div className="absolute top-[-10%] right-[-5%] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <LayoutGrid size={300} strokeWidth={1} />
          </div>
        </Link>

        {/* STRUČNI JEZIK - DARK KARTICA */}
        <Link href={`/learn/${job?.id || '1'}`} className="group relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl hover:shadow-slate-300 transition-all hover:-translate-y-1">
          <div className="relative z-10 flex flex-col h-full">
            <div className="bg-orange-500 self-start p-3 rounded-2xl mb-6 shadow-lg shadow-orange-500/50">
              <Zap size={32} fill="currentColor" />
            </div>
            <h2 className="text-3xl font-black mb-1 flex items-center gap-2 flex-wrap">
              <span>{professionPrefix.main}:</span> <span className="text-orange-500">{jobName}</span>
            </h2>
            {!professionPrefix.isOnlyHr && <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 opacity-80">{professionPrefix.sub}: {job?.name_hr}</p>}
            
            <div className="text-slate-400 font-medium text-lg max-w-xs mb-8">
              <p>{professionDesc.main}</p>
            </div>
            <div className="mt-auto flex items-center gap-2 font-black bg-orange-500 text-white self-start px-6 py-3 rounded-2xl group-hover:gap-4 transition-all">
              {enterBtn.main} <ChevronRight size={20} />
            </div>
          </div>
          <div className="absolute bottom-[-10%] right-[-5%] opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <Trophy size={300} strokeWidth={1} />
          </div>
        </Link>

      </div>

      {/* SECONDARY SECTION - NAPREDAK I TESTOVI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* TESTOVI ZNANJA */}
        <div className="md:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-slate-800">{testsTitle.main}</h3>
              {!testsTitle.isOnlyHr && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{testsTitle.sub}</span>}
            </div>
            <span className="text-sm font-bold text-blue-600 cursor-pointer hover:underline">{seeAll.main}</span>
          </div>
          
          <div className="space-y-4">
            {availableTests.map((test, i) => {
              // Brzinski prijevod naziva testova koristeći postojeći 't' (Ovo bi bilo idealno vući iz baze u budućnosti)
              const testTrans = t(test.titleHr); 
              
              return (
                <div key={i} className="flex items-center justify-between p-4 rounded-3xl border border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${test.color}`}>
                      <MessageSquare size={20} />
                    </div>
                    <div className="flex flex-col">
                      <p className="font-black text-slate-700">{testTrans.main}</p>
                      {!testTrans.isOnlyHr && <p className="text-[10px] font-bold text-slate-400 uppercase">{testTrans.sub}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-400">{test.xp}</span>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DAILY GOAL CARD */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white flex flex-col shadow-lg shadow-indigo-200">
          <div className="flex flex-col mb-6">
             <h3 className="text-xl font-black">{goalTitle.main}</h3>
             {!goalTitle.isOnlyHr && <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">{goalTitle.sub}</span>}
          </div>
          
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path className="text-white/20" strokeDasharray="100, 100" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-white" strokeDasharray="75, 100" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-black">75%</span>
            </div>
          </div>
          <div className="text-center text-indigo-100 font-medium text-sm mb-4">
            <p>{goalDesc.main}</p>
            {!goalDesc.isOnlyHr && <p className="text-[10px] uppercase font-bold text-indigo-300 mt-1">{goalDesc.sub}</p>}
          </div>
          <button className="mt-auto w-full bg-white text-indigo-600 font-black py-4 rounded-2xl hover:bg-indigo-50 transition-colors shadow-lg">
            {smashBtn.main}
          </button>
        </div>

      </div>
    </div>
  );
}