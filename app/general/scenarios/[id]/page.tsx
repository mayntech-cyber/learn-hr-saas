import { createClient } from "@/utils/supabase/server"; // ✅ Novi import za server
import ScenarioClient from "@/components/ScenarioClient";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function GeneralScenarioDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // ✅ Inicijaliziramo sigurni server klijent unutar funkcije
  const supabase = await createClient();

  const resolvedParams = await params;
  const scenarioId = resolvedParams.id;

  const { data: scenario } = await supabase
    .from('scenarios')
    .select('name_hr, translations')
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
    <div className="w-full min-h-screen">
      <ScenarioClient scenarios={phrases || []} category={scenario} />
    </div>
  );
}