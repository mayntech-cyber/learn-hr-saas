import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TestsClient from "@/components/TestsClient";
import LockedScreen from "@/components/LockedScreen";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function QuizzesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  const planId = sub?.plan_id ?? "ind_free";

  const { data: features } = await supabase
    .from("plan_features")
    .select("feature_key")
    .eq("plan_id", planId)
    .eq("is_enabled", true);

  const featureKeys = features?.map(f => f.feature_key) ?? [];
  const hasBasicTests = featureKeys.includes("basic_tests");

  if (!hasBasicTests) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        <LockedScreen 
          currentPlanId={planId} 
          featureName="Testovi i ocjene" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TestsClient userId={user.id} />
    </div>
  );
}