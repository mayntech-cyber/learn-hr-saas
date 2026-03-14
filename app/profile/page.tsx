import { supabase } from "@/lib/supabase";
import ProfileClient from "@/components/ProfileClient";

export const revalidate = 0;

export default async function ProfilePage() {
  // Simulirani podaci korisnika (kasnije: const { data: user } = await supabase.auth.getUser())
  const user = {
    name: "Ivan Radnis",
    email: "ivan.radnik@email.com",
    joined: "Siječanj 2024",
    jobId: 1
  };

  const { data: job } = await supabase
    .from('jobs')
    .select('name_hr, translations')
    .eq('id', user.jobId)
    .single();

  return <ProfileClient user={user} job={job} />;
}