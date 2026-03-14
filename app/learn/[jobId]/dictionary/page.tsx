import { supabase } from "@/lib/supabase";
import DictionaryClient from "@/components/DictionaryClient"; 

export const revalidate = 0;

export default async function DictionaryGridPage({ params }: { params: Promise<{ jobId: string }> }) {
  const resolvedParams = await params;
  const jobId = resolvedParams.jobId;

  // Vučemo zanimanje i riječi iz baze (s prijevodima)
  const { data: job } = await supabase
    .from('jobs')
    .select('id, name_hr, translations, category_id')
    .eq('id', jobId)
    .single();
    
  const { data: words } = await supabase
    .from('dictionary')
    .select('id, hr_word, translations, image_url, audio_url')
    .eq('job_id', jobId)
    .order('id', { ascending: true });

  // OVDJE JE BILA GREŠKA: Vraćamo SAMO klijentsku komponentu, BEZ onog starog <div className="mb-8"> Headera!
  return <DictionaryClient words={words || []} job={job} />;
}