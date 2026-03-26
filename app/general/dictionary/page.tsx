// app/general/dictionary/page.tsx
import { createClient } from "@/utils/supabase/server";
import GeneralDictionaryClient from "@/components/GeneralDictionaryClient";

export const revalidate = 0;

export default async function GeneralDictionaryPage() {
  const supabase = await createClient(); 

  const { data: words, error } = await supabase
    .from('dictionary')
    .select('id, hr_word, translations, image_url, audio_url, word_type, category') 
    .order('hr_word', { ascending: true })
    .limit(10000); 

  // Dohvati kategorije s prijevodima
  const { data: categories } = await supabase
    .from('dictionary_categories')
    .select('id, slug, label, emoji, translations, parent_id')
    .order('sort_order', { ascending: true });

  if (error) console.error("Greška:", error);

  return <GeneralDictionaryClient words={words || []} categoryData={categories || []} />;
}