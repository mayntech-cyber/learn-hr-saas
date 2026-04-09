"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Briefcase, User, ChevronRight, Loader2, Globe2, Check, ArrowLeft, Rocket, Star, Zap } from "lucide-react";
import { useLanguage } from "./LanguageContext";

const PLANS = [
  {
    id: "ind_free",
    emoji: "🌱",
    nameKey: "Crolingo Start",
    priceKey: "Besplatno zauvijek",
    descKey: "Level 1, 3 scenarija, rječnik s audio izgovorom.",
    color: "border-slate-200 hover:border-slate-300",
    activeColor: "border-slate-800 bg-slate-50",
    icon: Star,
  },
  {
    id: "ind_basic_monthly",
    emoji: "📚",
    nameKey: "Crolingo Basic",
    priceKey: "€6.99 / mj.",
    descKey: "Kompletni A1+A2 tečaj, sve igre i scenariji.",
    color: "border-blue-100 hover:border-blue-300",
    activeColor: "border-blue-600 bg-blue-50",
    icon: Zap,
  },
  {
    id: "ind_plus_monthly",
    emoji: "⭐",
    nameKey: "Crolingo Plus",
    priceKey: "€9.99 / mj.",
    descKey: "A1→B2 sve razine, certifikati, offline mod.",
    color: "border-indigo-100 hover:border-indigo-300",
    activeColor: "border-indigo-600 bg-indigo-50",
    badge: "Najpopularnije",
    icon: Rocket,
  },
  {
    id: "ind_pro_monthly",
    emoji: "🏆",
    nameKey: "Crolingo Pro",
    priceKey: "€14.99 / mj.",
    descKey: "Sve + stručni rječnik sva zanimanja, stručni certifikati.",
    color: "border-amber-100 hover:border-amber-300",
    activeColor: "border-amber-600 bg-amber-50",
    icon: Star,
  },
];

export default function OnboardingClient({ allJobs }: { allJobs: any[] }) {
  const router = useRouter();
  const supabase = createClient();
  const { uiMode, openModal, euLang, nativeLang, t } = useLanguage();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isProPlan = selectedPlan === "ind_pro_monthly" || selectedPlan === "ind_plus_monthly";
  const totalSteps = isProPlan ? 3 : 2;

  // Prijevodi
  const tTitle = t("Skoro smo gotovi! 🎉");
  const tSubtitle = t("Prije nego krenemo s učenjem, trebamo samo par detalja.");
  const tNameLabel = t("Kako se zoveš?");
  const tNamePlaceholder = t("Npr. Ivan Horvat");
  const tPlanLabel = t("Odaberi svoj plan");
  const tJobLabel = t("Što si po struci?");
  const tBtnFinish = t("Završi prijavu");
  const tNext = t("Dalje");
  const tBack = t("Natrag");
  const tPopular = t("Najpopularnije");
  const tFreeForever = t("Besplatno zauvijek");
  const tFreePlanDesc = t("Isprobaj platformu. Prvih 10 lekcija besplatno.");
  const tGeneralDesc = t("Cijeli A1+A2 tečaj, scenariji i testovi.");
  const tProDesc = t("Sve + stručni jezik, certifikat i offline mod.");

  const getJobName = (job: any) => {
    if (uiMode === 'hr') return job.name_hr;
    if (uiMode === 'eu' && job.name_en) return job.name_en;
    const trans = job.translations || {};
    const currentLangCode = uiMode === 'native' ? nativeLang : euLang;
    return trans[currentLangCode] || job.name_hr;
  };

  const getPlanDesc = (planId: string) => {
    return t(PLANS.find(p => p.id === planId)?.descKey ?? "").main;
  };

  const handleSave = async () => {
    if (!name || !selectedPlan) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Update profila
      await supabase
        .from('profiles')
        .update({
          full_name: name,
          current_job_id: jobId ? Number(jobId) : null,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      // Update pretplate na odabrani plan
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingSub) {
        await supabase
          .from('subscriptions')
          .update({ plan_id: selectedPlan })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('subscriptions')
          .insert({ user_id: user.id, plan_id: selectedPlan, status: 'active' });
      }

      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleNextFromPlan = () => {
    if (!selectedPlan) return;
    if (isProPlan) {
      setStep(3);
    } else {
      handleSaveNoJob();
    }
  };

  const handleSaveNoJob = async () => {
    if (!name || !selectedPlan) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ full_name: name, onboarding_completed: true })
        .eq('id', user.id);

      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingSub) {
        await supabase.from('subscriptions').update({ plan_id: selectedPlan }).eq('user_id', user.id);
      } else {
        await supabase.from('subscriptions').insert({ user_id: user.id, plan_id: selectedPlan, status: 'active' });
      }

      router.push('/dashboard');
      router.refresh();
    }
  };

  // Progress bar postotak
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 animate-in fade-in duration-700">

      {/* LANGUAGE PICKER */}
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
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8 md:p-12">

          {/* HEADER */}
          <div className="mb-8 text-center md:text-left">
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
                    onKeyDown={(e) => e.key === 'Enter' && name && setStep(2)}
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

          {/* STEP 2: ODABIR PLANA */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between ml-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  {tPlanLabel.main}
                </label>
                <button onClick={() => setStep(1)} className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:underline">
                  <ArrowLeft size={14} /> {tBack.main}
                </button>
              </div>

              <div className="space-y-3">
                {PLANS.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  const Icon = plan.icon;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full p-5 rounded-[1.5rem] border-2 text-left transition-all relative ${
                        isSelected ? plan.activeColor : plan.color + " bg-white"
                      }`}
                    >
                      {plan.badge && (
                        <span className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-full">
                          ⭐ {tPopular.main}
                        </span>
                      )}
                      <div className="flex items-center gap-4">
                        <div className={`text-2xl`}>{plan.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-800">{plan.nameKey}</span>
                            <span className={`text-sm font-bold ${isSelected ? "text-blue-600" : "text-slate-400"}`}>
                              {plan.id === "ind_free" ? tFreeForever.main : plan.priceKey}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {getPlanDesc(plan.id)}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="text-blue-600 flex-shrink-0">
                            <Check size={20} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextFromPlan}
                disabled={!selectedPlan || loading}
                className="w-full bg-blue-600 text-white py-5 rounded-[1.8rem] font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-20 active:scale-95 group"
              >
                {loading
                  ? <Loader2 size={24} className="animate-spin" />
                  : isProPlan
                  ? <>{tNext.main} <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" /></>
                  : <>{tBtnFinish.main} <Check size={22} /></>
                }
              </button>
            </div>
          )}

          {/* STEP 3: ZANIMANJE (samo za Pro) */}
          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between ml-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  {tJobLabel.main}
                </label>
                <button onClick={() => setStep(2)} className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:underline">
                  <ArrowLeft size={14} /> {tBack.main}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                {allJobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setJobId(job.id)}
                    className={`p-5 rounded-[1.5rem] border-2 text-left transition-all flex flex-col gap-2 relative ${
                      jobId === job.id
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl w-fit ${jobId === job.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                      <Briefcase size={18} />
                    </div>
                    <span className={`font-black leading-tight text-sm ${jobId === job.id ? "text-blue-900" : "text-slate-700"}`}>
                      {getJobName(job)}
                    </span>
                    {jobId === job.id && (
                      <div className="absolute top-3 right-3 text-blue-600">
                        <Check size={18} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSave}
                disabled={loading || !jobId}
                className="w-full bg-blue-600 text-white py-5 rounded-[1.8rem] font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-20 active:scale-95"
              >
                {loading
                  ? <Loader2 size={24} className="animate-spin" />
                  : <>{tBtnFinish.main} <Check size={22} /></>
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}