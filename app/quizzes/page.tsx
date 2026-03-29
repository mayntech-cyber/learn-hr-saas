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

  const { data: bgData } = await supabase
    .from("dictionary")
    .select("image_url")
    .not("image_url", "is", null)
    .limit(1)
    .single();

  const bgImage = bgData?.image_url ?? null;

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
    <div
      className="w-full min-h-screen"
      style={bgImage ? {
        backgroundImage: `linear-gradient(rgba(255,255,255,0.65), rgba(255,255,255,0.65)), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'scroll',
      } : undefined}
    >
      <TestsClient userId={user.id} userPlan={planId} bgImage={bgImage} />
    </div>
  );
}