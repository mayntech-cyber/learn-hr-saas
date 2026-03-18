import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import OnboardingClient from "@/components/OnboardingClient";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // OVDJE JE KLJUČ: Dodali smo name_en i translations!
  const { data: allJobs } = await supabase
    .from('jobs')
    .select('id, name_hr, name_en, translations')
    .order('name_hr');

  return <OnboardingClient allJobs={allJobs || []} />;
}