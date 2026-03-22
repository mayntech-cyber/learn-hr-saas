"use client";

import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";

export default function ScenariosGridClient({ scenarios }: { scenarios: any[] }) {
  const { euLang, nativeLang, t } = useLanguage();

  // Prijevodi za Header (preseljeno iz page.tsx radi automatizacije)
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
          // Prijevodi samog sadržaja scenarija iz baze
          const euTranslation = s.translations?.[euLang] || s.name_en || "";
          const nativeTranslation = s.translations?.[nativeLang] || "";

          return (
            <Link 
              key={s.id} 
              href={`/general/scenarios/${s.id}`}
              className="group relative h-64 rounded-[2.5rem] overflow-hidden shadow-md hover:shadow-2xl transition-all hover:-translate-y-2 border border-slate-100"
            >
              {/* Pozadinska slika */}
              <img 
                src={s.icon_name || 'https://images.unsplash.com/photo-1555436169-20d9321f98bc?q=80&w=1000'} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={s.name_hr}
              />
              
              {/* Overlay - GRADIENT ZA BOLJU ČITLJIVOST */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              {/* Sadržaj na kartici */}
              <div className="absolute bottom-8 left-8 right-8">
                
                {/* Hrvatski original u malom bedžu (UVIJEK VIDLJIV) */}
                <div className="mb-3">
                  <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">
                    {s.name_hr}
                  </span>
                </div>

                {/* Dinamični naslov na odabranom jeziku sučelja */}
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
                    {euTranslation}
                  </h2>
                  
                  {/* Prikaz materinjeg jezika (ako je odabran) */}
                  {nativeTranslation && (
                    <span className="text-emerald-400 font-bold text-sm">
                       {nativeTranslation}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}