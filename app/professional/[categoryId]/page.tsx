import { createClient } from "@/utils/supabase/server"; // ✅ Novi import za server
import CategoryJobsClient from "@/components/CategoryJobsClient";

export const revalidate = 0;

export default async function CategoryJobsPage({ params }: { params: Promise<{ categoryId: string }> }) {
  // ✅ Inicijaliziramo sigurni server klijent unutar funkcije
  const supabase = await createClient();

  const resolvedParams = await params;
  const categoryId = resolvedParams.categoryId;

  // 1. Vučemo ime Sektora
  const { data: category } = await supabase
    .from('categories')
    .select('name_hr, translations, image_url')
    .eq('id', categoryId)
    .single();

  // 2. Vučemo Zanimanja
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, name_hr, translations, image_url, dictionary(count)')
    .eq('category_id', categoryId);

  if (error) {
    console.error("Greška kod učitavanja zanimanja:", error);
  }

  // Šaljemo sve u Klijentsku komponentu
  return <CategoryJobsClient category={category} jobs={jobs || []} />;
}