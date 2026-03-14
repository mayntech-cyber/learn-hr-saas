// app/general/dictionary/page.tsx
import { supabase } from "@/lib/supabase";
import GeneralDictionaryClient from "@/components/GeneralDictionaryClient";

export const revalidate = 0;

export default async function GeneralDictionaryPage() {
  const { data: words, error } = await supabase
    .from('dictionary')
    .select('id, hr_word, translations, image_url, audio_url, word_type') 
    .order('hr_word', { ascending: true })
    .limit(10000); 

  if (error) console.error("Greška:", error);

  // Samo prosljeđujemo čiste podatke klijentskoj komponenti
  return <GeneralDictionaryClient words={words || []} />;
}