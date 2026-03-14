import { supabase } from "@/lib/supabase";
import ScenarioClient from "@/components/ScenarioClient";

export const revalidate = 0;

export default async function ScenariosPage({ params }: { params: Promise<{ jobId: string }> }) {
  const resolvedParams = await params;
  const jobId = resolvedParams.jobId;

  // 1. DODANO: Vučemo i 'translations' za posao kako bi Klijent mogao prevesti naslov!
  const { data: job } = await supabase
    .from('jobs')
    .select('id, name_hr, translations, category_id')
    .eq('id', jobId)
    .single();

  // 2. Tražimo ID scenarija za ovo zanimanje
  const { data: scenarioCategory } = await supabase
    .from('scenarios')
    .select('id')
    .eq('profession_id', jobId)
    .single(); 

  let phrases: any[] = [];
  
  if (scenarioCategory) {
    // 3. Vučemo FRAZE iz prave tablice
    const { data, error } = await supabase
      .from('scenario_phrases')
      .select('id, phrase_hr, translations') 
      .eq('scenario_id', scenarioCategory.id)
      .order('id', { ascending: true });

    if (error) {
      console.error("Greška kod učitavanja fraza:", error);
    } else if (data) {
      phrases = data;
    }
  }

  // ŠALJEMO PODATKE KLIJENTU (I fraze i podatke o poslu!)
  return <ScenarioClient scenarios={phrases} job={job} />;
}