"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProfessionCard from "@/components/ProfessionCard";
import CategoryHeader from "@/components/CategoryHeader";
import { useLanguage } from "@/components/LanguageContext";

export default function CategoryJobsClient({ category, jobs }: { category: any, jobs: any[] }) {
  const { t } = useLanguage();

  // Prijevodi za UI ove stranice
  const back = t("Nazad na sektore");
  const emptyMsg = t("Još nema dodanih zanimanja u ovom sektoru.");

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER S DVOJEZIČNIM GUMBOM */}
      <div style={{ background: 'rgba(10,30,60,0.65)', borderRadius: 16, padding: '1.5rem', color: 'white' }}>
        <Link href="/professional" className="group inline-flex flex-col mb-6">
          <div className="flex items-center gap-2 text-sm font-bold transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <ArrowLeft size={16} />
            <span>{back.main}</span>
          </div>
          {!back.isOnlyHr && (
            <span className="text-[10px] font-bold ml-6 uppercase tracking-tighter italic" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {back.sub}
            </span>
          )}
        </Link>

        {/* Tvoj postojeći CategoryHeader */}
        <CategoryHeader category={category} />
      </div>

      {/* GRID ZANIMANJA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {jobs && jobs.length > 0 ? (
          jobs.map((job: any) => {
            const wordCount = job.dictionary[0]?.count || 0;

            return (
              <ProfessionCard 
                key={job.id} 
                id={job.id.toString()} 
                nameHr={job.name_hr} 
                translations={job.translations} 
                imageUrl={job.image_url} 
                wordCount={wordCount} 
              />
            );
          })
        ) : (
          <div className="col-span-2 bg-slate-50 p-10 rounded-3xl border border-slate-100 text-center flex flex-col items-center">
            <p className="text-slate-500 font-bold">{emptyMsg.main}</p>
            {!emptyMsg.isOnlyHr && (
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">{emptyMsg.sub}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}