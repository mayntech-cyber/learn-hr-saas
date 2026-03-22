"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Briefcase, User, ChevronRight, Loader2, Globe2, Check, ArrowLeft } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function OnboardingClient({ allJobs }: { allJobs: any[] }) {
  const router = useRouter();
  const supabase = createClient();
  const { uiMode, openModal, euLang, nativeLang, t } = useLanguage(); 

  const [step, setStep] = useState(1); // Korak 1: Ime, Korak 2: Zanimanje
  const [name, setName] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // PRIJEVODI
  const tTitle = t("Skoro smo gotovi! 🎉");
  const tSubtitle = t("Prije nego krenemo s učenjem, trebamo samo par detalja.");
  const tNameLabel = t("Kako se zoveš?");
  const tNamePlaceholder = t("Npr. Ivan Horvat");
  const tJobLabel = t("Što si po struci?");
  const tBtnFinish = t("Završi prijavu");
  const tNext = t("Dalje");

  const getJobName = (job: any) => {
    if (uiMode === 'hr') return job.name_hr;
    if (uiMode === 'eu' && job.name_en) return job.name_en;
    const trans = job.translations || {};
    const currentLangCode = uiMode === 'native' ? nativeLang : euLang;
    return trans[currentLangCode] || job.name_hr;
  };

  const handleSave = async () => {
    if (!name || !jobId) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from('profiles')
        .update({ 
          full_name: name,
          current_job_id: Number(jobId) 
        })
        .eq('id', user.id);

      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 animate-in fade-in duration-700">
      
      {/* LANGUAGE PICKER - Lebdi iznad */}
      <button 
        onClick={openModal}
        className="mb-8 bg-white flex items-center gap-3 px-6 py-3 rounded-full shadow-md border border-slate-100 text-slate-700 font-black hover:scale-105 transition-all active:scale-95"
      >
        <Globe2 size={20} className="text-blue-500" />
        <span className="uppercase text-xs tracking-widest">{uiMode}</span>
      </button>

      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        
        {/* PROGRESS BAR */}
        <div className="h-1.5 w-full bg-slate-100">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out" 
            style={{ width: step === 1 ? '50%' : '100%' }}
          ></div>
        </div>

        <div className="p-8 md:p-12">
          {/* HEADER */}
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-3">
              {tTitle.main}
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              {tSubtitle.main}
            </p>
          </div>

          {/* STEP 1: IME */}
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                  {tNameLabel.main}
                </label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={tNamePlaceholder.main}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-[1.8rem] pl-14 pr-6 py-5 text-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <button 
                onClick={() => name && setStep(2)}
                disabled={!name}
                className="w-full bg-slate-900 text-white py-5 rounded-[1.8rem] font-black flex items-center justify-center gap-3 shadow-xl hover:bg-blue-600 transition-all disabled:opacity-20 active:scale-95 group"
              >
                {tNext.main} <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* STEP 2: ZANIMANJE */}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between ml-2">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                    {tJobLabel.main}
                  </label>
                  <button onClick={() => setStep(1)} className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:underline">
                    <ArrowLeft size={14} /> Natrag
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {allJobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setJobId(job.id)}
                      className={`p-6 rounded-[2rem] border-2 text-left transition-all flex flex-col gap-3 group relative overflow-hidden ${
                        jobId === job.id 
                        ? "border-blue-600 bg-blue-50 shadow-md" 
                        : "border-slate-100 bg-white hover:border-slate-200"
                      }`}
                    >
                      <div className={`p-3 rounded-2xl w-fit ${jobId === job.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                        <Briefcase size={20} />
                      </div>
                      <span className={`font-black text-lg leading-tight ${jobId === job.id ? "text-blue-900" : "text-slate-700"}`}>
                        {getJobName(job)}
                      </span>
                      {jobId === job.id && (
                        <div className="absolute top-4 right-4 text-blue-600">
                          <Check size={20} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleSave}
                disabled={loading || !jobId}
                className="w-full bg-blue-600 text-white py-5 rounded-[1.8rem] font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-20 active:scale-95"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : (
                  <>
                    {tBtnFinish.main} <Check size={22} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}