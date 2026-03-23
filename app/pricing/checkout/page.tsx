"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://admin.maynpost.com";

const PLAN_NAMES: Record<string, string> = {
  ind_general: "Opći",
  ind_pro: "Full Pro",
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("plan");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCheckout = async () => {
      // Free plan — nema naplate, samo update u bazi
      if (planId === "ind_free") {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("subscriptions")
            .update({ plan_id: "ind_free" })
            .eq("user_id", user.id);
        }
        router.push("/dashboard");
        return;
      }

      if (!planId || !PLAN_NAMES[planId]) {
        setError("Nepoznati plan");
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // Pozovi backend Stripe checkout API
        const response = await fetch(`${BACKEND_URL}/api/stripe/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            userId: user.id,
            userEmail: user.email,
            successUrl: `${window.location.origin}/pricing/success`,
            cancelUrl: `${window.location.origin}/pricing`,
          }),
        });

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          setError(data.error || "Greška pri kreiranju checkout sesije");
          setLoading(false);
        }
      } catch (err) {
        setError("Greška pri spajanju s platnim sustavom");
        setLoading(false);
      }
    };

    startCheckout();
  }, [planId, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-4xl">😕</div>
        <h2 className="text-xl font-black text-slate-800">Nešto je pošlo po krivu</h2>
        <p className="text-slate-500">{error}</p>
        <button
          onClick={() => router.push("/pricing")}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          Natrag na planove
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-slate-600 font-bold">
        Preusmjeravamo te na sigurno plaćanje...
      </p>
      <p className="text-slate-400 text-sm">
        Plan: {PLAN_NAMES[planId || ""] || planId}
      </p>
    </div>
  );
}