"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const MESSAGES = [
  { emoji: "🔒", title: "Ups, ovo nije za tebe!", sub: "Barem ne još... 😏" },
  { emoji: "🙈", title: "Ne gledaj ovamo!", sub: "Ovo je VIP zona." },
  { emoji: "🚧", title: "Radovi u tijeku!", sub: "Za tvoj plan, barem." },
  { emoji: "🎭", title: "Iza kulisa!", sub: "Nadogradi i uđi u backstage." },
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
  const [msg] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
  const [shake, setShake] = useState(false);

  // Trese bravu svake 3 sekunde
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      
      {/* Animirani emoji */}
      <div
        className={`text-7xl mb-6 select-none transition-transform duration-100 ${
          shake ? "animate-bounce" : ""
        }`}
        style={{
          filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.12))",
          animation: shake ? "shake 0.5s ease-in-out" : undefined,
        }}
      >
        {msg.emoji}
      </div>

      {/* Poruka */}
      <h2 className="text-3xl font-black text-slate-800 mb-2">{msg.title}</h2>
      <p className="text-slate-500 font-medium text-lg mb-1">{msg.sub}</p>
      
      {featureName && (
        <p className="text-slate-400 text-sm mb-6">
          <span className="font-bold text-slate-600">{featureName}</span> nije dostupno na tvom trenutnom planu.
        </p>
      )}

      {/* Plan badge */}
      <div className="flex items-center gap-3 mb-8 bg-slate-100 rounded-2xl px-6 py-3">
        <span className="text-slate-500 text-sm font-medium">Trenutni plan:</span>
        <span className="font-black text-slate-800 bg-white px-3 py-1 rounded-xl shadow-sm text-sm">
          {currentName}
        </span>
        <span className="text-slate-400">→</span>
        <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl text-sm">
          {upgradeName}
        </span>
      </div>

      {/* Gumb */}
      <Link
        href="/pricing"
        className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all hover:-translate-y-0.5 active:translate-y-0 text-lg"
      >
        🚀 Nadogradi plan
      </Link>

      <p className="text-slate-400 text-xs mt-4 font-medium">
        Otkaz u bilo koje vrijeme · Bez skrivenih troškova
      </p>

      {/* CSS animacija shake */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-15deg) scale(1.1); }
          40% { transform: rotate(15deg) scale(1.1); }
          60% { transform: rotate(-10deg); }
          80% { transform: rotate(10deg); }
        }
      `}</style>
    </div>
  );
}