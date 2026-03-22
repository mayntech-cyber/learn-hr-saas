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
  badge?: string;
  icon: any;
  features: string[];
  annualPrice: number;
}> = {
  ind_free: {
    emoji: "🌱",
    color: "text-slate-700",
    bg: "bg-white",
    border: "border-slate-200",
    icon: Star,
    annualPrice: 0,
    features: [
      "Prvih 10 lekcija (A1 osnove)",
      "Rječnik s audio izgovorom",
      "XP bodovi i dnevni streaks",
      "UI na svom jeziku",
    ],
  },
  ind_general: {
    emoji: "📚",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Zap,
    annualPrice: 39,
    features: [
      "Cijeli A1 + A2 tečaj",
      "Svakodnevni scenariji",
      "Pomoćni jezik po izboru",
      "Osnovni testovi i ocjene",
      "Leaderboard",
    ],
  },
  ind_pro: {
    emoji: "🏆",
    color: "text-white",
    bg: "bg-gradient-to-br from-blue-600 to-indigo-700",
    border: "border-blue-500",
    badge: "Najpopularnije",
    icon: Rocket,
    annualPrice: 59,
    features: [
      "Cijeli A1 + A2 tečaj",
      "Stručni jezik (1 sektor)",
      "Scenariji s radnog mjesta",
      "Svi testovi i ocjene",
      "Interni certifikat završetka",
      "Offline mod",
      "Progres se prenosi u B2B",
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
  const tSave = t("Uštedi 2 mj.");
  const tCurrent = t("Trenutni plan");
  const tUpgrade = t("Odaberi plan");
  const tDowngrade = t("Promijeni plan");
  const tFree = t("Besplatno zauvijek");
  const tPerMonth = t("/ mj.");
  const tPerYear = t("/ god.");
  const tNoHidden = t("Bez skrivenih troškova · Otkaz u bilo koje vrijeme");
  const tAllCurrencies = t("Sve cijene u eurima");
  const tPopular = t("Najpopularnije");

  const planOrder = ["ind_free", "ind_general", "ind_pro"];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-blue-100">
          <Rocket size={14} /> LearnHR Pro
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
          {tTitle.main}
        </h1>
        <p className="text-slate-500 text-lg font-medium">{tSub.main}</p>

        {/* Toggle Mjesečno / Godišnje */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`text-sm font-bold ${!annual ? "text-slate-800" : "text-slate-400"}`}>
            {tMonthly.main}
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
              annual ? "bg-blue-600" : "bg-slate-200"
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
              annual ? "left-8" : "left-1"
            }`} />
          </button>
          <span className={`text-sm font-bold flex items-center gap-2 ${annual ? "text-slate-800" : "text-slate-400"}`}>
            {tAnnual.main}
            <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-2 py-0.5 rounded-full">
              {tSave.main}
            </span>
          </span>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {planOrder.map((planId) => {
          const plan = plans.find(p => p.id === planId);
          const config = PLAN_CONFIG[planId];
          if (!config) return null;

          const isCurrent = currentPlanId === planId;
          const isPopular = planId === "ind_pro";
          const isPro = planId === "ind_pro";
          const price = plan?.price_eur ?? 0;
          const annualPrice = config.annualPrice;
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
                {price === 0 ? (
                  <div className={`text-3xl font-black ${isPro ? "text-white" : "text-slate-800"}`}>
                    {tFree.main}
                  </div>
                ) : (
                  <div>
                    <div className={`flex items-baseline gap-1 ${isPro ? "text-white" : "text-slate-800"}`}>
                      <span className="text-4xl font-black">
                        €{annual ? (annualPrice / 12).toFixed(2) : price}
                      </span>
                      <span className={`text-sm font-bold ${isPro ? "text-blue-200" : "text-slate-400"}`}>
                        {tPerMonth.main}
                      </span>
                    </div>
                    {annual && (
                      <p className={`text-sm font-bold mt-1 ${isPro ? "text-blue-200" : "text-slate-400"}`}>
                        €{annualPrice} {tPerYear.main}
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
                  href={`/pricing/checkout?plan=${planId}`}
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