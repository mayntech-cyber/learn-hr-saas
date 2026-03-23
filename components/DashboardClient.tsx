"use client";

import {
  Trophy,
  Flame,
  BookOpen,
  Zap,
  ChevronRight,
  Star,
  GraduationCap,
  Target,
  CheckCircle2,
  Circle,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";

export default function DashboardClient({ job, profile }: { job: any; profile: any }) {
  const { euLang, nativeLang, t, uiMode } = useLanguage();

  const displayName = profile?.full_name?.split(" ")[0] || "Radniče";
  const greeting = t(`Bok, ${displayName}! 👋`);
  const greetingSub = t("Tvoj put do majstora hrvatskog jezika se nastavlja.");

  const getJobName = () => {
    if (!job) return "";
    if (uiMode === "hr") return job.name_hr;
    const trans = job.translations || {};
    if (uiMode === "native" && trans[nativeLang]) return trans[nativeLang];
    if (uiMode === "eu" && trans[euLang]) return trans[euLang];
    return job.name_hr;
  };
  const jobName = getJobName();

  // Simulirani podaci lekcija (zamijenit ćemo s bazom u sljedećem koraku)
  const lessons = [
    { id: 1, titleHr: "Osnove gradilišta", xp: 50, status: "done" },
    { id: 2, titleHr: "Komunikacija s kolegama", xp: 80, status: "active" },
    { id: 3, titleHr: "Sigurnost na radu", xp: 100, status: "locked" },
    { id: 4, titleHr: "Alati i materijali", xp: 120, status: "locked" },
  ];

  const modules = [
    {
      icon: <BookOpen size={22} />,
      title: t("Opći jezik"),
      sub: t("Osnove"),
      href: "/general",
      bg: "bg-blue-600",
      shadow: "shadow-blue-200",
    },
    {
      icon: <Zap size={22} fill="currentColor" />,
      title: { main: jobName || "Stručni", sub: "", isOnlyHr: true },
      sub: { main: "Struka", sub: "", isOnlyHr: true },
      href: `/learn/${job?.id || "1"}`,
      bg: "bg-slate-900",
      shadow: "shadow-slate-200",
    },
    {
      icon: <GraduationCap size={22} />,
      title: t("Testovi"),
      sub: { main: "3 nova", sub: "", isOnlyHr: true },
      href: "/quizzes",
      bg: "bg-emerald-600",
      shadow: "shadow-emerald-200",
    },
    {
      icon: <Target size={22} />,
      title: t("Dnevni cilj"),
      sub: { main: "75%", sub: "", isOnlyHr: true },
      href: "/dashboard",
      bg: "bg-violet-600",
      shadow: "shadow-violet-200",
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-6 pb-24 md:pb-10 md:pt-10 space-y-6 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
            {greeting.main}
          </h1>
          {!greeting.isOnlyHr && (
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
              {greeting.sub}
            </p>
          )}
          <p className="text-slate-500 text-sm font-medium mt-1">
            {greetingSub.main}
          </p>
        </div>
      </div>

      {/* STATS — kompaktno u redu */}
      <div className="flex gap-3">
        <div className="flex-1 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-xl text-white shrink-0">
            <Flame size={16} fill="currentColor" />
          </div>
          <div>
            <p className="text-[9px] font-black text-orange-700 uppercase tracking-wider">
              {t("Dnevni niz").main}
            </p>
            <p className="text-lg font-black text-orange-600 leading-tight">
              5 <span className="text-xs font-bold">{t("dana").main}</span>
            </p>
          </div>
        </div>

        <div className="flex-1 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-xl text-white shrink-0">
            <Star size={16} fill="currentColor" />
          </div>
          <div>
            <p className="text-[9px] font-black text-blue-700 uppercase tracking-wider">
              {t("Bodovi").main}
            </p>
            <p className="text-lg font-black text-blue-600 leading-tight">
              {profile?.xp_points?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        <div className="flex-1 bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="bg-violet-500 p-2 rounded-xl text-white shrink-0">
            <Trophy size={16} />
          </div>
          <div>
            <p className="text-[9px] font-black text-violet-700 uppercase tracking-wider">
              {t("Razina").main}
            </p>
            <p className="text-lg font-black text-violet-600 leading-tight">
              A1
            </p>
          </div>
        </div>
      </div>

      {/* MODULI — horizontalni scroll */}
      <div>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
          {t("Moduli").main}
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {modules.map((mod, i) => (
            <Link
              key={i}
              href={mod.href}
              className={`${mod.bg} shadow-lg ${mod.shadow} rounded-2xl p-4 flex flex-col gap-3 min-w-[110px] snap-start shrink-0 active:scale-95 transition-transform`}
            >
              <div className="bg-white/20 rounded-xl p-2 self-start text-white">
                {mod.icon}
              </div>
              <div>
                <p className="text-white font-black text-sm leading-tight">
                  {mod.title.main}
                </p>
                <p className="text-white/60 text-[10px] font-bold mt-0.5">
                  {mod.sub.main}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* TJEDNI NAPREDAK */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-black text-slate-700">
            {t("Tjedni napredak").main}
          </p>
          <p className="text-sm font-black text-violet-600">75%</p>
        </div>
        <div className="bg-slate-100 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-violet-500 to-blue-500 h-2 rounded-full transition-all duration-700"
            style={{ width: "75%" }}
          />
        </div>
        <p className="text-[10px] text-slate-400 font-medium mt-2">
          {t("Još samo 5 riječi do današnjeg cilja!").main}
        </p>
      </div>

      {/* LEKCIJE — nastavi gdje si stao */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {t("Nastavi učiti").main}
          </h2>
          <Link
            href="/general"
            className="text-xs font-black text-blue-600 hover:underline"
          >
            {t("Vidi sve").main}
          </Link>
        </div>
        <div className="space-y-2">
          {lessons.map((lesson) => {
            const lessonT = t(lesson.titleHr);
            const isDone = lesson.status === "done";
            const isActive = lesson.status === "active";
            const isLocked = lesson.status === "locked";

            return (
              <div
                key={lesson.id}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  isActive
                    ? "bg-blue-50 border-blue-200 shadow-sm shadow-blue-100"
                    : isDone
                    ? "bg-white border-slate-100"
                    : "bg-slate-50 border-slate-100 opacity-60"
                }`}
              >
                {/* Icon status */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isDone
                      ? "bg-emerald-100 text-emerald-600"
                      : isActive
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 size={20} />
                  ) : isActive ? (
                    <Circle size={20} className="fill-blue-600 text-blue-600" />
                  ) : (
                    <Lock size={18} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-slate-800 truncate">
                    {lessonT.main}
                  </p>
                  {!lessonT.isOnlyHr && (
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                      {lessonT.sub}
                    </p>
                  )}
                </div>

                {/* XP + arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-black px-2 py-1 rounded-lg ${
                      isDone
                        ? "bg-emerald-50 text-emerald-600"
                        : isActive
                        ? "bg-blue-50 text-blue-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    +{lesson.xp} XP
                  </span>
                  {!isLocked && (
                    <ChevronRight size={16} className="text-slate-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}