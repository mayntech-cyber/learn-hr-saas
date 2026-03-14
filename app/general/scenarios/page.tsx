import { supabase } from "@/lib/supabase";
import ScenariosGridClient from "@/components/ScenariosGridClient";

export const revalidate = 0;

export default async function GeneralScenariosPage() {
  const { data: scenarios } = await supabase
    .from('scenarios')
    .select('*')
    .eq('type', 'general')
    .order('id', { ascending: true });

  // Samo šaljemo podatke klijentu
  return <ScenariosGridClient scenarios={scenarios || []} />;
}