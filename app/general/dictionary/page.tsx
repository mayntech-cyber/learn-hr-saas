// app/general/dictionary/page.tsx
import { createClient } from "@/utils/supabase/server"; // ✅ Koristimo server.ts
import GeneralDictionaryClient from "@/components/GeneralDictionaryClient";

export const revalidate = 0;

export default async function GeneralDictionaryPage() {
  // ✅ 1. Inicijaliziramo Supabase unutar funkcije
  // Napomena: ovisno o verziji tvog server.ts fajla, možda će raditi i bez 'await', 
  // ali po najnovijim standardima ide s await.
  const supabase = await createClient(); 

  const { data: words, error } = await supabase
    .from('dictionary')
    .select('id, hr_word, translations, image_url, audio_url, word_type') 
    .order('hr_word', { ascending: true })
    .limit(10000); 

  if (error) console.error("Greška:", error);

  // Samo prosljeđujemo čiste podatke klijentskoj komponenti
  return <GeneralDictionaryClient words={words || []} />;
}