import { createClient } from "@/utils/supabase/server";
import GeneralDictionaryClient from "@/components/GeneralDictionaryClient";

export const revalidate = 0;

export default async function GeneralDictionaryPage() {
  const supabase = await createClient(); 

  // Prvo fetchaj abeceda posebno — garantirano sva slova
  const { data: abecedaWords } = await supabase
    .from('dictionary')
    .select('id, hr_word, translations, image_url, audio_url, word_type, category')
    .eq('category', 'abeceda');

  // Ostale riječi bez abecede
  const { data: otherWords, error } = await supabase
    .from('dictionary')
    .select('id, hr_word, translations, image_url, audio_url, word_type, category')
    .neq('category', 'abeceda')
    .order('hr_word', { ascending: true })
    .limit(2000);

  const words = [...(abecedaWords || []), ...(otherWords || [])];

  const { data: categories } = await supabase
    .from('dictionary_categories')
    .select('id, slug, label, emoji, translations, parent_id')
    .order('sort_order', { ascending: true });

  if (error) console.error("Greška:", error);

  return <GeneralDictionaryClient words={words} categoryData={categories || []} />;
}