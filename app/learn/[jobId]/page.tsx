import { createClient } from "@/utils/supabase/server"; // ✅ Novi import za server
import JobHubClient from "@/components/JobHubClient";

export const revalidate = 0;

export default async function JobHubPage({ params }: { params: Promise<{ jobId: string }> }) {
  // ✅ Inicijaliziramo sigurni server klijent unutar funkcije
  const supabase = await createClient();

  const resolvedParams = await params;
  const jobId = resolvedParams.jobId;

  // Vučemo ime zanimanja + prijevode!
  const { data: job } = await supabase
    .from('jobs')
    .select('id, name_hr, translations, category_id')
    .eq('id', jobId)
    .single();

  return <JobHubClient job={job} />;
}