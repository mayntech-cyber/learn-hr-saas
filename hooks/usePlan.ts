"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function usePlan() {
  const [planId, setPlanId] = useState<string | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Dohvati aktivnu pretplatu
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (!sub) { setLoading(false); return; }
      setPlanId(sub.plan_id);

      // Dohvati enabled featureove za taj plan
      const { data: featureData } = await supabase
        .from("plan_features")
        .select("feature_key")
        .eq("plan_id", sub.plan_id)
        .eq("is_enabled", true);

      if (featureData) {
        setFeatures(featureData.map(f => f.feature_key));
      }

      setLoading(false);
    };
    fetch();
  }, []);

  const hasFeature = (key: string) => features.includes(key);

  return { planId, features, loading, hasFeature };
}