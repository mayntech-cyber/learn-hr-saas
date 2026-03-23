import Link from "next/link";

export default function PricingSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center">
      <div className="text-7xl animate-bounce">🎉</div>
      <h1 className="text-4xl font-black text-slate-800">Uspješno plaćanje!</h1>
      <p className="text-slate-500 text-lg max-w-md">
        Tvoja pretplata je aktivirana. Dobrodošao u premium LearnHR iskustvo!
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl shadow-lg transition-all"
        >
          🚀 Idi na Dashboard
        </Link>
        <Link
          href="/pricing"
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black px-8 py-4 rounded-2xl transition-all"
        >
          Moji planovi
        </Link>
      </div>
    </div>
  );
}