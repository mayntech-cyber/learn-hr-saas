import { createClient } from "@/utils/supabase/server"; // ✅ Novi import za server
import ScenariosGridClient from "@/components/ScenariosGridClient";

export const revalidate = 0;

export default async function GeneralScenariosPage() {
  // ✅ Inicijalizacija Supabase server klijenta unutar funkcije
  const supabase = await createClient();

  const { data: scenarios } = await supabase
    .from('scenarios')
    .select('*')
    .eq('type', 'general')
    .order('id', { ascending: true });

  // Samo šaljemo podatke klijentu
  return <ScenariosGridClient scenarios={scenarios || []} />;
}