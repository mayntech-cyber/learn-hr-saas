import { createClient } from "@/utils/supabase/server"; // Koristimo novi server klijent
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Dohvaćamo profil iz baze
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  console.log("DEBUG - Korisnik ID:", user.id);
  console.log("DEBUG - Profil iz baze:", profile);

  // ---> NOVO: ČUVAR KOJI PREUSMJERAVA NA ONBOARDING <---
  // Ako je ime prazno ili zanimanje nije odabrano, pošalji ga na onboarding!
  if (!profile?.full_name || !profile?.current_job_id) {
    redirect("/onboarding");
  }

  // Ako smo došli do ovdje, znači da korisnik sigurno ima 'current_job_id'
  const jobId = profile.current_job_id;
  const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single();

  return <DashboardClient job={job} profile={profile} />;
}