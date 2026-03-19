"use client";

import { User, Mail, Calendar, Briefcase, Settings, Globe2, LogOut, Award, Edit2, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client"; // Treba nam klijent za promjenu u bazi
import { useRouter } from "next/navigation"; // Za osvježavanje stranice

export default function ProfileClient({ user, job, allJobs }: { user: any, job: any, allJobs: any[] }) {
  const { euLangName, nativeLangName, uiMode, openModal, t } = useLanguage();
  const router = useRouter();
  const supabase = createClient();

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
    <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER KARTICA */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-50"></div>
        
        <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg relative z-10">
          <User size={48} />
        </div>

        <div className="text-center md:text-left relative z-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{user.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Mail size={16} /> {user.email}
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Calendar size={16} /> {tJoined.main} {user.joined}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* POSTAVKE JEZIKA KARTICA */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/30">
                <Globe2 size={24} />
              </div>
              <button 
                onClick={openModal}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
              >
                <Settings size={20} />
              </button>
            </div>

            <h2 className="text-xl font-black mb-2">{tSettings.main}</h2>
            {!tSettings.isOnlyHr && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{tSettings.sub}</p>}

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-slate-400 text-sm font-bold">UI Language:</span>
                <span className="font-black text-orange-400 uppercase">{uiMode}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-slate-400 text-sm font-bold">Auxiliary:</span>
                <span className="font-black text-white uppercase">{euLangName || "English"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm font-bold">Native:</span>
                <span className="font-black text-blue-400 uppercase">{nativeLangName || "Arabic"}</span>
              </div>
            </div>

            <button 
              onClick={openModal}
              className="mt-8 w-full bg-white text-slate-900 font-black py-4 rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-lg"
            >
              {tChangeLanguages.main}
            </button>
          </div>
        </div>

        {/* ZANIMANJE KARTICA */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 leading-none">{tJob.main}</h3>
                  {!tJob.isOnlyHr && <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{tJob.sub}</p>}
                </div>
              </div>
              
              {/* Gumb za izmjenu */}
              {!isEditingJob && (
                <button 
                  onClick={() => setIsEditingJob(true)}
                  className="text-sm font-bold text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Edit2 size={16} /> Izmijeni
                </button>
              )}
            </div>
            
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 min-h-[100px]">
              {isEditingJob ? (
                // PADAJUĆI IZBORNIK KADA SE KLIKNE "IZMIJENI"
                <div className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                  <select 
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {allJobs?.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.name_hr}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditingJob(false)}
                      className="flex-1 py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Odustani
                    </button>
                    <button 
                      onClick={handleSaveJob}
                      disabled={isSaving}
                      className="flex-1 py-2 text-sm font-black text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-md shadow-blue-500/30 flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      Spremi
                    </button>
                  </div>
                </div>
              ) : (
                // NORMALAN PRIKAZ
                <div className="animate-in fade-in duration-300">
                  <p className="text-2xl font-black text-slate-800">{getJobName(job)}</p>
                  <p className="text-sm font-bold text-blue-500 uppercase mt-1 tracking-tighter italic">Stručni program: {job?.name_hr}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                   <Award size={20} />
                </div>
                <span className="font-black text-slate-700">12 {tCoursesFinished.main}</span>
             </div>
             <button 
  onClick={handleLogout}
  className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 font-bold text-sm"
>
   <LogOut size={18} /> {tLogout.main}
</button>
          </div>
        </div>

      </div>
    </div>
  );
}