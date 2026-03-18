import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/ProfileClient";

export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = await createClient();

  // 1. Dohvati ulogiranog korisnika
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Dohvati njegove stvarne podatke iz tablice 'profiles'
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const joinedDate = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString('hr-HR', { month: 'long', year: 'numeric' })
    : "Siječanj 2024";

  // ---> OVDJE JE BIO KVAR: Sad vučemo pravi current_job_id iz baze! <---
  const userData = {
    name: profile?.full_name || "Korisnik",
    email: user.email,
    joined: joinedDate,
    jobId: profile?.current_job_id || 1, 
    xp_points: profile?.xp_points || 0
  };

  // 3. Dohvati stvarni posao korisnika (s prijevodima!)
  const { data: job } = await supabase
    .from('jobs')
    .select('id, name_hr, name_en, translations')
    .eq('id', userData.jobId)
    .single();

  // 4. Dohvati sve poslove za padajući izbornik
  const { data: allJobs } = await supabase
    .from('jobs')
    .select('id, name_hr, name_en, translations')
    .order('name_hr');

  return <ProfileClient user={userData} job={job} allJobs={allJobs || []} />;
}