"use client";

import { Briefcase } from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
import { useLanguage } from "@/components/LanguageContext";

export default function SectorsClient({ categories }: { categories: any[] }) {
  const { t } = useLanguage();

  // Prijevodi za naslove
  const title = t("Sektori");
  const subtitle = t("Odaberi sektor u kojem radiš kako bi vidio dostupna zanimanja.");
  const emptyMsg = t("Nema pronađenih sektora.");

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* --- DVOJEZIČNI HEADER --- */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="bg-slate-800 p-3 rounded-2xl text-white shadow-md">
            <Briefcase size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-none">
              {title.main}
            </h1>
            {!title.isOnlyHr && (
              <p className="text-[11px] font-black text-slate-400 uppercase mt-1 tracking-widest italic opacity-80">
                {title.sub}
              </p>
            )}
          </div>
        </div>
        
        <div className="text-slate-500 font-medium">
          <p>{subtitle.main}</p>
          {!subtitle.isOnlyHr && (
            <p className="text-xs font-bold text-slate-400 uppercase mt-0.5 tracking-wide">
              {subtitle.sub}
            </p>
          )}
        </div>
      </div>

      {/* --- GRID KATEGORIJA --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories && categories.length > 0 ? (
          categories.map((category: any) => {
            const jobCount = category.jobs[0]?.count || 0;

            return (
              <CategoryCard 
                key={category.id} 
                id={category.id.toString()} 
                nameHr={category.name_hr} 
                translations={category.translations} 
                imageUrl={category.image_url} 
                jobCount={jobCount} 
              />
            );
          })
        ) : (
          <div className="text-slate-500 col-span-2 text-center p-10 bg-slate-50 rounded-2xl border border-slate-100">
             <p className="font-bold">{emptyMsg.main}</p>
             {!emptyMsg.isOnlyHr && <p className="text-xs uppercase mt-1">{emptyMsg.sub}</p>}
          </div>
        )}
      </div>

    </div>
  );
}