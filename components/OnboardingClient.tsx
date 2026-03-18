"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Briefcase, User, ChevronRight, Loader2, Globe2 } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function OnboardingClient({ allJobs }: { allJobs: any[] }) {
  const router = useRouter();
  const supabase = createClient();
  
  // 1. Vučemo SVE iz tvog jezičnog konteksta (uključujući t funkciju i kodove jezika)
  const { uiMode, openModal, euLang, nativeLang, t } = useLanguage(); 
  
  const [name, setName] = useState("");
  const [jobId, setJobId] = useState(allJobs[0]?.id || "");
  const [loading, setLoading] = useState(false);

  // --- 2. KORISTIMO TVOJ SUSTAV PRIJEVODA ---
  // Ove ključeve sada možeš prevesti u svom "UI translations" dijelu u pozadini!
  const tTitle = t("Skoro smo gotovi! 🎉");
  const tSubtitle = t("Prije nego krenemo s učenjem, trebamo samo par detalja.");
  const tNameLabel = t("Kako se zoveš?");
  const tNamePlaceholder = t("Npr. Ivan Horvat");
  const tJobLabel = t("Što si po struci?");
  const tBtnFinish = t("Završi prijavu");

  // --- 3. PRAVILNO ČITANJE JSON PRIJEVODA ZANIMANJA ---
  const getJobName = (job: any) => {
    // 1. Ako je HR, vrati hrvatski
    if (uiMode === 'hr') return job.name_hr;
    
    // 2. Ako je EU (engleski) i imamo engleski naziv u bazi, vrati njega
    if (uiMode === 'eu' && job.name_en) return job.name_en;

    // 3. Za Native jezike (arapski, nepalski...)
    const trans = job.translations || {};
    const currentLangCode = uiMode === 'native' ? nativeLang : euLang;
    
    // 🔴 DETEKTIV ZA TEBE: Ovo će ispisati u konzoli što aplikacija točno pokušava pročitati
    console.log(`Tražim jezik: ${currentLangCode} za posao: ${job.name_hr}`, trans);

    // Ako u JSON-u postoji ključ (npr. 'ar'), vrati njega. Ako ne, vrati hrvatski.
    return trans[currentLangCode] || job.name_hr;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 animate-in fade-in duration-700">
      
      {/* GUMB ZA PROMJENU JEZIKA */}
      <button 
        onClick={openModal}
        className="mb-6 bg-white flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
      >
        <Globe2 size={18} className="text-orange-500" />
        <span className="uppercase">{uiMode}</span>
      </button>

      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-50"></div>
        
        <div className="relative z-10">
          {/* DINAMIČNI NASLOVI PREKO t() FUNKCIJE */}
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
            {tTitle.main}
          </h1>
          <p className="text-slate-500 font-medium mb-8">
            {tSubtitle.main}
          </p>

          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <User size={16} className="text-blue-500" /> 
                {tNameLabel.main}
              </label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tNamePlaceholder.main}
                className="w-full border border-slate-200 rounded-2xl p-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Briefcase size={16} className="text-orange-500" /> 
                {tJobLabel.main}
              </label>
              <select 
                required
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full border border-slate-200 rounded-2xl p-4 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50 focus:bg-white transition-colors appearance-none cursor-pointer"
              >
                {allJobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {getJobName(job)}
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading || !name || !jobId}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-8"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : (
                <>
                  {tBtnFinish.main} 
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}