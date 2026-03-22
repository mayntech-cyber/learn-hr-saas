"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, HardHat, GraduationCap, User, Globe2, Settings, MousePointer2 } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export default function Navigation() {
  const pathname = usePathname();
  const { euLangName, nativeLangName, uiMode, openModal, t } = useLanguage();

  // --- DINAMIČNI PRIJEVODI IZ BAZE ---
  const tNavDash = t("Nadzorna ploča");
  const tNavGen = t("Opći jezik");
  const tNavProf = t("Stručni jezik");
  const tNavTests = t("Testovi");
  const tNavProfile = t("Profil");
  
  const tSub = t("Za radnike i agencije");
  const tSysSettings = t("Postavke sustava");
  const tUiLang = t("Jezik sučelja");
  const tLearnProg = t("Program učenja");
  const tMain = t("Glavni:");
  const tAux = t("Pomoćni:");
  const tNative = t("Materinji:");
  const tChangeLang = t("Promijeni jezike"); // tooltip

  // Rekonstrukcija navItems-a s dinamičnim t() podacima
  const navItems = [
    { nameObj: tNavDash, href: "/dashboard", icon: Home },
    { nameObj: tNavGen, href: "/general", icon: BookOpen },
    { nameObj: tNavProf, href: "/professional", icon: HardHat },
    { nameObj: tNavTests, href: "/quizzes", icon: GraduationCap },
    { nameObj: tNavProfile, href: "/profile", icon: User },
  ];

  const getUiLanguageName = () => {
    if (uiMode === 'hr') return "Hrvatski";
    if (uiMode === 'eu') return euLangName || "English";
    if (uiMode === 'native') return nativeLangName || "Arabic";
    return "Hrvatski";
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 shadow-sm z-50">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-black text-blue-600 tracking-tight">LearnHR<span className="text-orange-500">.</span></h1>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{tSub.main}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-blue-100/50" : "bg-white border border-slate-100 group-hover:bg-slate-200/50"}`}>
                   <Icon size={18} className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"} />
                </div>
                <div className="flex flex-col">
                  <span className={`font-black ${isActive ? "text-blue-700" : ""}`}>
                    {item.nameObj.main}
                  </span>
                  {!item.nameObj.isOnlyHr && (
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? "text-blue-400" : "text-slate-400"} mt-0.5`}>
                      {item.nameObj.sub}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* MODERNIZIRANE POSTAVKE SUSTAVA NA DNU */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tSysSettings.main}</span>
               {!tSysSettings.isOnlyHr && <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{tSysSettings.sub}</span>}
            </div>
            <button 
              onClick={openModal} 
              className="text-blue-600 hover:text-blue-800 bg-blue-100 p-1.5 rounded-lg transition-all active:scale-90 shadow-sm shrink-0"
              title={tChangeLang.main}
            >
              <Settings size={16} />
            </button>
          </div>
          
          <div className="space-y-2">
            {/* 1. KARTICA: JEZIK SUČELJA */}
            <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-12 h-12 bg-blue-50 rounded-bl-full opacity-50"></div>
               <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 relative z-10">
                 <MousePointer2 size={10} /> 
                 <span>{tUiLang.main}</span>
               </div>
               <div className="text-sm font-black text-blue-600 uppercase tracking-tight truncate relative z-10">
                 {getUiLanguageName()}
               </div>
            </div>

            {/* 2. KARTICA: JEZICI KOJE KORISNIK UČI */}
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2">
               <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                 <BookOpen size={10} /> 
                 <span>{tLearnProg.main}</span>
               </div>
               
               <div className="space-y-2">
                 <div className="flex items-center justify-between bg-slate-50 px-2 py-1.5 rounded-lg">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tMain.main}</span>
                   <span className="text-[11px] font-black text-slate-700">HRVATSKI</span>
                 </div>
                 <div className="flex items-center justify-between px-2">
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tAux.main}</span>
                   <span className="text-[10px] font-black text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded-md">{euLangName || "ENG"}</span>
                 </div>
                 <div className="flex items-center justify-between px-2">
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{tNative.main}</span>
                   <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md">{nativeLangName || "ARA"}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM BAR */}
      <nav className="md:hidden fixed bottom-0 w-full h-16 bg-white border-t border-slate-200 flex justify-around items-center px-1 z-50 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
         {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-full h-full relative group">
              {isActive && <div className="absolute top-0 w-8 h-1 bg-blue-600 rounded-b-full"></div>}
              
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-blue-50/50 mt-1" : "group-hover:bg-slate-50"}`}>
                <Icon size={22} className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"} />
              </div>
              <span className={`text-[9px] font-black mt-0.5 tracking-tighter truncate w-full text-center px-1 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                {item.nameObj.main}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}