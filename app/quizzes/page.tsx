import React from "react";
import TestsClient from "@/components/TestsClient";
import { createClient } from "@/utils/supabase/server"; // <-- OVO JE TAJNA: Tvoj provjereni klijent!

export default async function QuizzesPage() {
  // 1. Pokrećemo Supabase na isti način kao u Dashboardu
  const supabase = await createClient();
  
  // 2. Dohvaćamo tvog korisnika
  const { data: { user } } = await supabase.auth.getUser();

  // 3. Šaljemo tvoj ID u Kviz
  return (
    <div className="min-h-screen bg-slate-50 md:pl-64 pb-20 md:pb-0">
      <TestsClient userId={user?.id} />
    </div>
  );
}