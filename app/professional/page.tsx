// app/professional/page.tsx (ili gdje ti je već ova datoteka)
import { supabase } from "@/lib/supabase";
import SectorsClient from "@/components/SectorsClient"; // Ovo ćemo sad napraviti

export const revalidate = 0;

export default async function ProfessionalPage() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name_hr, translations, image_url, icon_name, jobs(count)');

  if (error) {
    console.error("Greška kod učitavanja kategorija:", error);
  }

  // Šaljemo podatke u Klijentsku komponentu
  return <SectorsClient categories={categories || []} />;
}