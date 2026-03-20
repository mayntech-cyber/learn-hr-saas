// app/professional/page.tsx
import { createClient } from "@/utils/supabase/server"; // ✅ Novi import za server
import SectorsClient from "@/components/SectorsClient"; 

export const revalidate = 0;

export default async function ProfessionalPage() {
  // ✅ Inicijaliziramo sigurni server klijent unutar funkcije
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name_hr, translations, image_url, icon_name, jobs(count)');

  if (error) {
    console.error("Greška kod učitavanja kategorija:", error);
  }

  // Šaljemo podatke u Klijentsku komponentu
  return <SectorsClient categories={categories || []} />;
}