import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PricingClient from "@/components/PricingClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_id, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("product", "individual")
    .eq("is_active", true)
    .order("price_eur");

  return (
    <PricingClient
      currentPlanId={sub?.plan_id ?? "ind_free"}
      plans={plans ?? []}
    />
  );
}