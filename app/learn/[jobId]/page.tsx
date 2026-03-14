import { supabase } from "@/lib/supabase";
import JobHubClient from "@/components/JobHubClient";

export const revalidate = 0;

export default async function JobHubPage({ params }: { params: Promise<{ jobId: string }> }) {
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