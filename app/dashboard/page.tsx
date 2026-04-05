import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const jobId = profile.current_job_id;
  const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single();

  // Prefetch pozadinske slike na serveru — nema client-side flasha
  const { data: bgData } = await supabase
    .from("page_backgrounds")
    .select("url")
    .eq("active", true)
    .eq("media_type", "image");

  const bgImages = bgData
    ? [...bgData].sort(() => Math.random() - 0.5).map((d) => d.url)
    : [];

  return <DashboardClient job={job} profile={profile} bgImages={bgImages} />;
}
