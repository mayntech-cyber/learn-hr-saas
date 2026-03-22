import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import GeneralHubClient from "@/components/GeneralHubClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function GeneralHubPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Provjeri ima li korisnik pristup općem tečaju
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  // Free i svi ostali planovi imaju general_course_10 ili general_course_full
  // General hub je dostupan svima — sadržaj unutar se štiti posebno
  return <GeneralHubClient />;
}