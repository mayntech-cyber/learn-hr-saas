import React from "react";
import TestsClient from "@/components/TestsClient";
import { createClient } from "@/utils/supabase/server"; // <-- OVO JE TAJNA: Tvoj provjereni klijent!

export default async function QuizzesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <TestsClient userId={user?.id} />
    </div>
  );
}