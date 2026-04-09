"use client";
import { useState } from "react";
import { useLanguage } from "./LanguageContext";
import { Check, Zap, Star, Rocket, Lock } from "lucide-react";
import Link from "next/link";

type Plan = {
  id: string;
  name: string;
  price_eur: number;
  billing: string;
};

const PLAN_CONFIG: Record<string, {
  emoji: string;
  color: string;
  bg: string;
  border: string;
  badge?: string | null;
  icon: any;
  features: string[];
  monthlyPrice: number;
  annualPlanId: string;
  annualPrice: number;
  annualMonthly: number;
}> = {
  ind_free: {
    emoji: "🌱",
    color: "text-slate-700",
    bg: "bg-white",
    border: "border-slate-200",
    icon: Star,
    monthlyPrice: 0,
    annualPlanId: "ind_free",
    annualPrice: 0,
    annualMonthly: 0,
    badge: null,
    features: [
      "Level 1 (A1 osnove)",
      "3 scenarija i 3 testa",
      "Rječnik s audio izgovorom",
      "XP bodovi i dnevni streaks",
      "UI na svom jeziku",
      "Preview zaključanog sadržaja 🔒",
    ],
  },
  ind_basic_monthly: {
    emoji: "📚",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Zap,
    monthlyPrice: 6.99,
    annualPlanId: "ind_basic_yearly",
    annualPrice: 55.99,
    annualMonthly: 4.67,
    badge: null,
    features: [
      "Kompletni A1 + A2 tečaj",
      "Sve igre i gamifikacija",
      "Svi scenariji A1+A2",
      "Interni certifikat A1 i A2",
      "XP, streaks, leaderboard",
      "1 pomoćni jezik sučelja",
    ],
  },
  ind_plus_monthly: {
    emoji: "⭐",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: Star,
    monthlyPrice: 9.99,
    annualPlanId: "ind_plus_yearly",
    annualPrice: 79.99,
    annualMonthly: 6.67,
    badge: "Najpopularnije",
    features: [
      "Sve iz Basic plana",
      "A1 → B2 sve razine",
      "Svi certifikati A1-B2",
      "Offline mod",
      "do 3 jezika sučelja",
      "1 zanimanje stručnog (teaser)",
    ],
  },
  ind_pro_monthly: {
    emoji: "🏆",
    color: "text-white",
    bg: "bg-gradient-to-br from-blue-600 to-indigo-700",
    border: "border-blue-500",
    icon: Rocket,
    monthlyPrice: 14.99,
    annualPlanId: "ind_pro_yearly",
    annualPrice: 119.99,
    annualMonthly: 10.00,
    badge: null,
    features: [
      "Sve iz Plus plana",
      "Stručni rječnik — sva zanimanja (73)",
      "Scenariji s radnog mjesta",
      "Stručni certifikati po zanimanju",
      "Neograničeni jezici sučelja",
      "Spreman za tržište rada! 🚀",
    ],
  },
};

export default function PricingClient({
  currentPlanId,
  plans,
}: {
  currentPlanId: string;
  plans: Plan[];
}) {
  const { t } = useLanguage();
  const [annual, setAnnual] = useState(false);

  const tTitle = t("Odaberi svoj plan");
  const tSub = t("Počni besplatno. Nadogradi kad si spreman.");
  const tMonthly = t("Mjesečno");
  const tAnnual = t("Godišnje");
  const tSave = t("Uštedi 20%");
  const tCurrent = t("Trenutni plan");
  const tUpgrade = t("Odaberi plan");
  const tDowngrade = t("Promijeni plan");
  const tFree = t("Besplatno zauvijek");
  const tPerMonth = t("/ mj.");
  const tPerYear = t("/ god.");
  const tNoHidden = t("Bez skrivenih troškova · Otkaz u bilo koje vrijeme");
  const tAllCurrencies = t("Sve cijene u eurima");
  const tPopular = t("Najpopularnije");

  const planOrder = ["ind_free", "ind_basic_monthly", "ind_plus_monthly", "ind_pro_monthly"];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="text-center mb-12" style={{ background: 'rgba(10,30,60,0.65)', borderRadius: 16, padding: '1.5rem', color: 'white' }}>
        <div className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}>
          <Rocket size={14} /> Crolingo
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight" style={{ color: 'white' }}>
          {tTitle.main}
        </h1>
        <p className="text-lg font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{tSub.main}</p>

        {/* Toggle Mjesečno / Godišnje */}
        <div className="inline-flex items-center gap-4 mt-8" style={{ background: 'rgba(10,30,60,0.65)', borderRadius: 50, padding: '0.5rem 1rem' }}>
          <span className="text-sm font-bold" style={{ color: !annual ? 'white' : 'rgba(255,255,255,0.4)' }}>
            {tMonthly.main}
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
              annual ? "bg-blue-500" : "bg-white/20"
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
              annual ? "left-8" : "left-1"
            }`} />
          </button>
          <span className="text-sm font-bold flex items-center gap-2" style={{ color: annual ? 'white' : 'rgba(255,255,255,0.4)' }}>
            {tAnnual.main}
            <span className="bg-emerald-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
              {tSave.main}
            </span>
          </span>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {planOrder.map((planId) => {
          const plan = plans.find(p => p.id === planId);
          const config = PLAN_CONFIG[planId];
          if (!config) return null;

          const isCurrent = currentPlanId === planId;
          const isPopular = config.badge === "Najpopularnije";
          const isPro = planId === "ind_pro_monthly";
          const displayPrice = annual ? config.annualMonthly : config.monthlyPrice;
          const Icon = config.icon;

          return (
            <div
              key={planId}
              className={`relative rounded-3xl border-2 p-8 flex flex-col transition-all duration-300 ${config.bg} ${config.border} ${
                isCurrent ? "ring-4 ring-blue-400 ring-offset-2 scale-[1.02]" : "hover:scale-[1.01] hover:shadow-xl"
              } ${isPro ? "shadow-2xl shadow-blue-200" : "shadow-md"}`}
            >
              {/* Badge */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                  ⭐ {tPopular.main}
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-4 right-6 bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                  ✓ {tCurrent.main}
                </div>
              )}

              {/* Emoji + Naziv */}
              <div className="mb-6">
                <div className="text-4xl mb-3">{config.emoji}</div>
                <h2 className={`text-2xl font-black ${isPro ? "text-white" : "text-slate-800"}`}>
                  {plan?.name ?? planId}
                </h2>
              </div>

              {/* Cijena */}
              <div className="mb-8">
                {displayPrice === 0 ? (
                  <div className={`text-3xl font-black ${isPro ? "text-white" : "text-slate-800"}`}>
                    {tFree.main}
                  </div>
                ) : (
                  <div>
                    <div className={`flex items-baseline gap-1 ${isPro ? "text-white" : "text-slate-800"}`}>
                      <span className="text-4xl font-black">
                        €{displayPrice.toFixed(2)}
                      </span>
                      <span className={`text-sm font-bold ${isPro ? "text-blue-200" : "text-slate-400"}`}>
                        {tPerMonth.main}
                      </span>
                    </div>
                    {annual && (
                      <p className={`text-sm font-bold mt-1 ${isPro ? "text-blue-200" : "text-slate-400"}`}>
                        €{config.annualPrice} {tPerYear.main}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-8">
                {config.features.map((feature, i) => {
                  const tFeature = t(feature);
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-full p-0.5 flex-shrink-0 ${
                        isPro ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"
                      }`}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span className={`text-sm font-medium ${isPro ? "text-blue-100" : "text-slate-600"}`}>
                        {tFeature.main}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Gumb */}
              {isCurrent ? (
                <div className={`w-full py-4 rounded-2xl font-black text-center text-sm ${
                  isPro ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  ✓ {tCurrent.main}
                </div>
              ) : (
                <Link
                  href={`/pricing/checkout?plan=${annual && planId !== 'ind_free' ? config.annualPlanId : planId}`}
                  className={`w-full py-4 rounded-2xl font-black text-center text-sm transition-all flex items-center justify-center gap-2 ${
                    isPro
                      ? "bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                      : planId === "ind_free"
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                  }`}
                >
                  {planId === "ind_free" ? (
                    <><Lock size={14} /> {tDowngrade.main}</>
                  ) : (
                    <><Rocket size={14} /> {tUpgrade.main}</>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center space-y-2">
        <p className="text-slate-400 text-sm font-medium">{tNoHidden.main}</p>
        <p className="text-slate-300 text-xs font-medium">{tAllCurrencies.main}</p>
      </div>
    </div>
  );
}
