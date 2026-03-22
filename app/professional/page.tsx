import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SectorsClient from "@/components/SectorsClient";
import LockedScreen from "@/components/LockedScreen";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function ProfessionalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Dohvati plan i featureove
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
  const hasAccess = featureKeys.includes("professional_1sector") || 
                    featureKeys.includes("professional_full");

  if (!hasAccess) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        <LockedScreen 
          currentPlanId={planId} 
          featureName="Stručni jezik" 
        />
      </div>
    );
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name_hr, translations, image_url, icon_name, jobs(count)");

  return <SectorsClient categories={categories || []} />;
}