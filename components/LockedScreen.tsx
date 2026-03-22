"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";

const MESSAGES = [
  { emoji: "🔒", titleKey: "Ups, ovo nije za tebe!", subKey: "Barem ne još... 😏" },
  { emoji: "🙈", titleKey: "Ne gledaj ovamo!", subKey: "Ovo je VIP zona." },
  { emoji: "🚧", titleKey: "Radovi u tijeku!", subKey: "Za tvoj plan, barem." },
  { emoji: "🎭", titleKey: "Iza kulisa!", subKey: "Nadogradi i uđi u backstage." },
];

const PLAN_NAMES: Record<string, string> = {
  ind_free:    "Free",
  ind_general: "Opći",
  ind_pro:     "Full Pro",
  biz_starter: "Business",
  biz_pro:     "Professional",
  biz_agency:  "Agency",
};

const UPGRADE_TO: Record<string, string> = {
  ind_free:    "ind_general",
  ind_general: "ind_pro",
  ind_pro:     "ind_pro",
};

export default function LockedScreen({
  currentPlanId,
  featureName,
}: {
  currentPlanId: string | null;
  featureName?: string;
}) {
  const { t } = useLanguage();
  const [msg, setMsg] = useState(MESSAGES[0]);

useEffect(() => {
  setMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
}, []);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentName = currentPlanId ? PLAN_NAMES[currentPlanId] ?? currentPlanId : "Free";
  const upgradePlan = currentPlanId ? UPGRADE_TO[currentPlanId] : "ind_general";
  const upgradeName = upgradePlan ? PLAN_NAMES[upgradePlan] : "Opći";

  const tTitle = t(msg.titleKey);
  const tSub = t(msg.subKey);
  const tFeature = featureName ? t(featureName) : null;
  const tNotAvailable = t("nije dostupno na tvom trenutnom planu.");
  const tCurrentPlan = t("Trenutni plan:");
  const tUpgrade = t("Nadogradi plan");
  const tNoHidden = t("Otkaz u bilo koje vrijeme · Bez skrivenih troškova");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      
      <div
        className={`text-7xl mb-6 select-none ${shake ? "animate-bounce" : ""}`}
        style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.12))" }}
      >
        {msg.emoji}
      </div>

      <h2 className="text-3xl font-black text-slate-800 mb-2">{tTitle.main}</h2>
      <p className="text-slate-500 font-medium text-lg mb-1">{tSub.main}</p>
      
      {tFeature && (
        <p className="text-slate-400 text-sm mb-6">
          <span className="font-bold text-slate-600">{tFeature.main}</span>{" "}
          {tNotAvailable.main}
        </p>
      )}

      <div className="flex items-center gap-3 mb-8 bg-slate-100 rounded-2xl px-6 py-3">
        <span className="text-slate-500 text-sm font-medium">{tCurrentPlan.main}</span>
        <span className="font-black text-slate-800 bg-white px-3 py-1 rounded-xl shadow-sm text-sm">{currentName}</span>
        <span className="text-slate-400">→</span>
        <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl text-sm">{upgradeName}</span>
      </div>

      <Link
        href="/pricing"
        className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all hover:-translate-y-0.5 text-lg"
      >
        🚀 {tUpgrade.main}
      </Link>

      <p className="text-slate-400 text-xs mt-4 font-medium">{tNoHidden.main}</p>
    </div>
  );
}