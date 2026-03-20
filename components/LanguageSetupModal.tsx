"use client";

import { useState, useEffect } from "react";
import { Globe2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client"; // ✅ Novi import za klijent
import { useLanguage } from "./LanguageContext";

export default function LanguageSetupModal() {
  // ✅ Inicijaliziramo Supabase klijent unutar komponente
  const supabase = createClient();

  const { isModalOpen, setLanguages, closeModal, euLang, nativeLang, uiMode } = useLanguage();
  
  const [languages, setDbLanguages] = useState<any[]>([]);
  const [selectedEu, setSelectedEu] = useState("en");
  const [selectedNative, setSelectedNative] = useState("ar");
  const [selectedUiMode, setSelectedUiMode] = useState<'hr' | 'eu' | 'native'>('hr');

  useEffect(() => {
    if (isModalOpen) {
      fetchLanguages();
      if (euLang) setSelectedEu(euLang);
      if (nativeLang) setSelectedNative(nativeLang);
      if (uiMode) setSelectedUiMode(uiMode);
    }
  }, [isModalOpen]);

  const fetchLanguages = async () => {
    // ✅ Ovdje će sada koristiti onaj sigurni klijent odozgo
    const { data } = await supabase.from('languages').select('*').order('name', { ascending: true });
    if (data) setDbLanguages(data);
  };

  if (!isModalOpen) return null;

  const euLanguages = languages.filter(l => l.type === 'eu');
  const nativeLanguages = languages.filter(l => l.type === 'native');

  const handleSave = () => {
    const euObj = euLanguages.find(l => l.code === selectedEu);
    const nativeObj = nativeLanguages.find(l => l.code === selectedNative);
    if (euObj && nativeObj) {
      setLanguages(euObj.code, euObj.name, nativeObj.code, nativeObj.name, selectedUiMode);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden relative">
        <div className="bg-blue-600 p-8 text-center text-white">
          <Globe2 className="mx-auto mb-4" size={40} />
          <h2 className="text-2xl font-black">Postavke jezika</h2>
          <p className="text-blue-100 opacity-80 uppercase text-[10px] font-bold tracking-widest">Language Settings</p>
        </div>

        <div className="p-8 space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EU Language</label>
            <select value={selectedEu} onChange={(e) => setSelectedEu(e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold mt-1">
              {euLanguages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Native Language</label>
            <select value={selectedNative} onChange={(e) => setSelectedNative(e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-3 font-bold mt-1">
              {nativeLanguages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Jezik navigacije / Interface Language</label>
            <select value={selectedUiMode} onChange={(e) => setSelectedUiMode(e.target.value as any)} className="w-full bg-white rounded-xl px-4 py-2 font-black mt-2 text-blue-600">
              <option value="hr">Hrvatski</option>
              <option value="eu">EU Language</option>
              <option value="native">Native Language</option>
            </select>
          </div>

          <button onClick={handleSave} className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-lg uppercase tracking-tight">
            Spremi promjene
          </button>
        </div>
      </div>
    </div>
  );
}