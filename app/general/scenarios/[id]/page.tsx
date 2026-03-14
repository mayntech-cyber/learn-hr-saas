import { supabase } from "@/lib/supabase";
import ScenarioClient from "@/components/ScenarioClient";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function GeneralScenarioDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const scenarioId = resolvedParams.id;

  const { data: scenario } = await supabase
    .from('scenarios')
    .select('name_hr')
    .eq('id', scenarioId)
    .single();

  // OVDJE JE BILA GREŠKA - Maknut audio_url jer ga nemaš u bazi još!
  const { data: phrases, error } = await supabase
    .from('scenario_phrases')
    .select('id, phrase_hr, translations') 
    .eq('scenario_id', scenarioId)
    .order('id', { ascending: true });

  if (error) {
    console.error("Greška kod fraza:", error);
  }

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto min-h-screen flex flex-col animate-in fade-in duration-500">
      
      <div className="mb-8">
        <Link href="/general/scenarios" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-600 mb-4 transition-colors">
          <ArrowLeft size={16} /> Nazad na sve scenarije
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
            <MessageSquare size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tight">
              {scenario?.name_hr || "Scenarij"}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Nauči ključne fraze za ovu situaciju.
            </p>
          </div>
        </div>
      </div>

      <ScenarioClient scenarios={phrases || []} />
    </div>
  );
}