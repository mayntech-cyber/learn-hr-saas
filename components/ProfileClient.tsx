"use client";

import { User, Mail, Calendar, Briefcase, Settings, Globe2, LogOut, Award, Edit2, CheckCircle2, Loader2, Flame } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client"; // Treba nam klijent za promjenu u bazi
import { useRouter } from "next/navigation"; // Za osvježavanje stranice

export default function ProfileClient({ user, job, allJobs }: { user: any, job: any, allJobs: any[] }) {
  const { euLangName, nativeLangName, uiMode, openModal, t } = useLanguage();
  const router = useRouter();
  const supabase = createClient();

  // DEBUG: provjera Google avatar polja
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log('USER METADATA:', user?.user_metadata);
      console.log('AVATAR URL:', user?.user_metadata?.avatar_url);
      console.log('PICTURE:', user?.user_metadata?.picture);
    });
  }, []);

  // State za promjenu zanimanja
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(user.jobId);

  // --- STATIČNI PRIJEVODI ---
  const tProfile = t("Profil");
  const tSettings = t("Postavke računa");
  const tJob = t("Zanimanje");
  const tJoined = t("Član od");
  const tChangeLanguages = t("Promijeni jezike učenja");
  const tLogout = t("Odjavi se");
  const tStatistics = t("Statistika");
  const tCoursesFinished = t("Završeni tečajevi");

  // Dinamični naziv posla
  const getJobName = (jobData: any) => {
    if (!jobData) return "";
    if (uiMode === 'hr') return jobData.name_hr;
    const trans = jobData.translations || {};
    return trans[uiMode === 'native' ? 'nativeLang' : 'euLang'] || jobData.name_hr;
  };

  // FUNKCIJA ZA SPREMANJE NOVOG POSLA U BAZU
  const handleSaveJob = async () => {
    setIsSaving(true);
    
    // Dohvati ID ulogiranog korisnika
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (authUser) {
      // Šaljemo Supabaseu: "Ažuriraj profil za ovog korisnika i stavi novi current_job_id"
      const { error } = await supabase
        .from('profiles')
        .update({ current_job_id: selectedJobId })
        .eq('id', authUser.id);

      if (!error) {
        setIsEditingJob(false);
        // Osvježavamo cijelu stranicu da se promjena vidi na ekranu
        router.refresh(); 
      }
    }
    setIsSaving(false);
  };

  // FUNKCIJA ZA ODJAVU
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // ili "/auth" ovisno o tome kako ti se zove stranica za prijavu
    router.refresh();
  };

  return (
    <div className="p-3 md:p-10 w-full animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* LEFT COLUMN */}
      <div className="space-y-3 md:space-y-6">

      {/* HEADER KARTICA */}
      <div className="rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-sm border border-slate-100 flex flex-row items-center gap-4 md:gap-8 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.85)' }}>
        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-blue-50 rounded-bl-full -z-0 opacity-50"></div>

        <div className="w-14 h-14 md:w-24 md:h-24 rounded-2xl md:rounded-3xl shadow-lg relative z-10 overflow-hidden flex-shrink-0">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-2xl md:text-4xl font-black">
              {user.name?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>

        <div className="text-left relative z-10 min-w-0">
          <h1 className="text-lg md:text-3xl font-black text-slate-800 tracking-tight truncate">{user.name}</h1>
          <div className="flex flex-col md:flex-row md:flex-wrap gap-1 md:gap-4 mt-1">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs md:text-sm truncate">
              <Mail size={13} className="flex-shrink-0" /> {user.email}
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs md:text-sm">
              <Calendar size={13} className="flex-shrink-0" /> {tJoined.main} {user.joined}
            </div>
          </div>
        </div>
      </div>

      {/* GRID: Postavke + Zanimanje — 2 stupca mobile, 40/60 desktop */}
      <div className="grid grid-cols-2 md:grid-cols-[2fr_3fr] gap-3 md:gap-6">

        {/* POSTAVKE JEZIKA KARTICA */}
        <div className="bg-slate-900 rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <div className="bg-orange-500 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-lg shadow-orange-500/30">
                <Globe2 size={16} className="md:hidden" />
                <Globe2 size={24} className="hidden md:block" />
              </div>
              <button
                onClick={openModal}
                className="bg-white/10 hover:bg-white/20 p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all"
              >
                <Settings size={14} className="md:hidden" />
                <Settings size={20} className="hidden md:block" />
              </button>
            </div>

            <h2 className="text-sm md:text-xl font-black mb-1 md:mb-2 leading-tight">{tSettings.main}</h2>
            {!tSettings.isOnlyHr && <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 md:mb-6">{tSettings.sub}</p>}

            <div className="space-y-2 md:space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-1.5 md:pb-2">
                <span className="text-slate-400 text-[10px] md:text-sm font-bold">UI:</span>
                <span className="font-black text-orange-400 uppercase text-[10px] md:text-sm">{uiMode}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-1.5 md:pb-2">
                <span className="text-slate-400 text-[10px] md:text-sm font-bold">Aux:</span>
                <span className="font-black text-white uppercase text-[10px] md:text-sm">{euLangName || "EN"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[10px] md:text-sm font-bold">Native:</span>
                <span className="font-black text-blue-400 uppercase text-[10px] md:text-sm">{nativeLangName || "AR"}</span>
              </div>
            </div>

            <button
              onClick={openModal}
              className="mt-4 md:mt-8 w-full bg-white text-slate-900 font-black py-2 md:py-4 rounded-xl md:rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-lg text-xs md:text-sm"
            >
              {tChangeLanguages.main}
            </button>
          </div>
        </div>

        {/* ZANIMANJE KARTICA */}
        <div className="rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 border border-slate-100 shadow-sm flex flex-col justify-between" style={{ background: 'rgba(255,255,255,0.85)' }}>
          <div>
            <div className="flex items-center justify-between mb-3 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-blue-50 p-2 md:p-3 rounded-xl md:rounded-2xl text-blue-600">
                  <Briefcase size={16} className="md:hidden" />
                  <Briefcase size={24} className="hidden md:block" />
                </div>
                <div>
                  <h3 className="text-sm md:text-lg font-black text-slate-800 leading-none">{tJob.main}</h3>
                  {!tJob.isOnlyHr && <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mt-0.5 md:mt-1 tracking-widest">{tJob.sub}</p>}
                </div>
              </div>

              {!isEditingJob && (
                <button
                  onClick={() => setIsEditingJob(true)}
                  className="text-[10px] md:text-sm font-bold text-blue-600 hover:bg-blue-50 p-1.5 md:p-2 rounded-lg md:rounded-xl transition-colors flex items-center gap-1"
                >
                  <Edit2 size={12} className="md:hidden" />
                  <Edit2 size={16} className="hidden md:block" />
                  <span className="hidden md:inline">Izmijeni</span>
                </button>
              )}
            </div>

            <div className="bg-slate-50 p-3 md:p-5 rounded-2xl md:rounded-3xl border border-slate-100 min-h-[60px] md:min-h-[100px]">
              {isEditingJob ? (
                <div className="flex flex-col gap-2 md:gap-3 animate-in fade-in zoom-in-95 duration-200">
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 md:p-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
                  >
                    {allJobs?.map((j) => (
                      <option key={j.id} value={j.id}>{j.name_hr}</option>
                    ))}
                  </select>

                  <div className="flex gap-1.5 md:gap-2">
                    <button
                      onClick={() => setIsEditingJob(false)}
                      className="flex-1 py-1.5 md:py-2 text-xs md:text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Odustani
                    </button>
                    <button
                      onClick={handleSaveJob}
                      disabled={isSaving}
                      className="flex-1 py-1.5 md:py-2 text-xs md:text-sm font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors flex justify-center items-center gap-1 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Spremi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  <p className="text-base md:text-2xl font-black text-slate-800 leading-tight">{getJobName(job)}</p>
                  <p className="text-[10px] md:text-sm font-bold text-blue-500 uppercase mt-1 tracking-tighter italic line-clamp-1">{job?.name_hr}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 md:mt-8 pt-4 md:pt-8 border-t border-slate-100 flex items-center gap-2 md:gap-3">
            <div className="bg-emerald-50 p-1.5 md:p-2 rounded-lg md:rounded-xl text-emerald-600">
              <Award size={14} className="md:hidden" />
              <Award size={20} className="hidden md:block" />
            </div>
            <span className="font-black text-slate-700 text-xs md:text-base">12 {tCoursesFinished.main}</span>
          </div>
        </div>

      </div>

      {/* STREAK KARTICA */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 flex items-center gap-4 md:gap-6 shadow-sm">
        <div className="bg-orange-500 p-3 md:p-4 rounded-2xl md:rounded-3xl text-white shadow-lg shadow-orange-500/30 flex-shrink-0">
          <Flame size={22} className="md:hidden" fill="currentColor" />
          <Flame size={32} className="hidden md:block" fill="currentColor" />
        </div>
        <div>
          <p className="text-[10px] md:text-xs font-black text-orange-800 uppercase tracking-widest">Dnevni niz</p>
          <p className="text-2xl md:text-4xl font-black text-orange-600 leading-none mt-0.5">
            {user.streak} <span className="text-base md:text-xl font-bold">dana 🔥</span>
          </p>
        </div>
      </div>

      {/* ODJAVA - dno stranice */}
      <div className="pt-2 pb-6 md:pb-8 flex justify-center">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 font-bold text-sm md:text-base transition-colors px-5 md:px-6 py-2.5 md:py-3 rounded-2xl hover:bg-red-50"
        >
          <LogOut size={18} /> {tLogout.main}
        </button>
      </div>

      </div>{/* END LEFT COLUMN */}

      {/* RIGHT COLUMN — stat cards */}
      <div className="grid grid-cols-2 gap-4 content-start">
        {[
          { title: "Ukupno XP", value: "—" },
          { title: "Naučene riječi", value: "—" },
          { title: "Završeni scenariji", value: "—" },
          { title: "Dnevni niz rekord", value: "—" },
          { title: "Položeni testovi", value: "—" },
          { title: "Rang", value: "—" },
        ].map((stat) => (
          <div
            key={stat.title}
            style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div className="w-9 h-9 rounded-full bg-white/15 mb-3" />
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">{stat.title}</p>
            <p className="text-3xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>{/* END RIGHT COLUMN */}

    </div>{/* END TWO-COLUMN GRID */}
    </div>
  );
}