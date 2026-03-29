"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MessageSquare, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { createClient } from "@/utils/supabase/client";

export default function ScenariosGridClient({ scenarios }: { scenarios: any[] }) {
  const { euLang, nativeLang, t } = useLanguage();
  const supabase = createClient();

  // phrase count po scenariju + completed status
  const [phraseCounts, setPhraseCounts] = useState<Record<string, number>>({});
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!scenarios?.length) return;

    const fetchProgress = async () => {
      const scenarioIds = scenarios.map(s => s.id);

      // Dohvati sve fraze za ove scenarije odjednom
      const { data: phrases } = await supabase
        .from('scenario_phrases')
        .select('scenario_id')
        .in('scenario_id', scenarioIds);

      if (phrases) {
        const counts: Record<string, number> = {};
        phrases.forEach(p => {
          counts[p.scenario_id] = (counts[p.scenario_id] || 0) + 1;
        });
        setPhraseCounts(counts);
      }

      // Dohvati completed scenarije za trenutnog usera
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progress } = await supabase
        .from('scenario_progress')
        .select('scenario_id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .in('scenario_id', scenarioIds);

      if (progress) {
        setCompletedIds(progress.map(p => p.scenario_id));
      }
    };

    fetchProgress();
  }, [scenarios]);

  // Prijevodi za Header
  const back = t("Nazad");
  const head = t("Svakodnevni scenariji");

  return (
    <div className="w-full max-w-7xl p-4 md:p-10 mx-auto min-h-screen flex flex-col animate-in fade-in duration-500">

      {/* 1. DVOJEZIČNA NAVIGACIJA */}
      <div className="mb-8">
        <Link href="/general" className="group inline-flex flex-col mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
            <ArrowLeft size={16} />
            <span>{back.main}</span>
          </div>
          {!back.isOnlyHr && (
            <span className="text-[10px] font-bold text-slate-300 ml-6 uppercase tracking-tighter italic">
              {back.sub}
            </span>
          )}
        </Link>

        {/* 2. DVOJEZIČNI HEADER */}
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <MessageSquare size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-none">
              {head.main}
            </h1>
            {!head.isOnlyHr && (
              <p className="text-[11px] font-black text-emerald-500 uppercase mt-1 tracking-widest italic opacity-80">
                {head.sub}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. GRID S KARTICAMA SCENARIJA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {scenarios?.map((s) => {
          const euTranslation = s.translations?.[euLang] || s.name_en || "";
          const nativeTranslation = s.translations?.[nativeLang] || "";
          const totalPhrases = phraseCounts[s.id] || 0;
          const isCompleted = completedIds.includes(s.id);

          // Naslov: native jezik ako postoji, inače eu jezik
          const mainTitle = nativeTranslation || euTranslation;
          const subTitle = nativeTranslation ? euTranslation : null;

          return (
            <Link
              key={s.id}
              href={`/general/scenarios/${s.id}`}
              className="group relative h-64 rounded-[2.5rem] overflow-hidden shadow-md hover:shadow-2xl transition-all hover:-translate-y-2 border border-slate-100 will-change-transform"
              style={{ isolation: 'isolate' }}
            >
              {/* Pozadinska slika */}
              <img
                src={s.icon_name || 'https://images.unsplash.com/photo-1555436169-20d9321f98bc?q=80&w=1000'}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-[2.5rem]"
                alt={s.name_hr}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Completed kvačica gore desno */}
              {isCompleted && (
                <div className="absolute top-4 right-4 z-10">
                  <CheckCircle2 size={28} className="text-emerald-400 drop-shadow-lg" fill="white" />
                </div>
              )}

              {/* Sadržaj na kartici */}
              <div className="absolute bottom-0 left-0 right-0 p-6">

                {/* Hrvatski badge */}
                <div className="mb-2">
                  <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">
                    {s.name_hr}
                  </span>
                </div>

                {/* Naslov — native jezik (fokus) */}
                <div className="flex flex-col gap-0.5 mb-3">
                  <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
                    {mainTitle}
                  </h2>
                  {subTitle && (
                    <span className="text-slate-300 font-medium text-sm italic">
                      {subTitle}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
                      0 / {totalPhrases} fraza
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '0%', background: '#10b981', borderRadius: 99 }} />
                  </div>
                </div>

              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
