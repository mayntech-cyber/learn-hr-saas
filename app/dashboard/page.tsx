import { supabase } from "@/lib/supabase";
import DashboardClient from "@/components/DashboardClient";

export const revalidate = 0;

export default async function DashboardPage() {
  // Simuliramo korisnika (npr. Zidara). 
  // Kasnije ćeš ovdje ubaciti pravu logiku (npr. await supabase.auth.getUser())
  const jobId = 1; 

  // Vučemo ime posla i prijevode kako bi Dashboard znao ispisati ime struke na stranom jeziku
  const { data: job } = await supabase
    .from('jobs')
    .select('id, name_hr, translations')
    .eq('id', jobId)
    .single();

  return <DashboardClient job={job} />;
}