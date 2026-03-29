import { createClient } from "@/utils/supabase/server"; // ✅ Novi import za server
import FlashcardPlayer from "@/components/FlashcardPlayer";

export const revalidate = 0;

export default async function GeneralPracticePage() {
  // ✅ Inicijaliziramo sigurni server klijent unutar funkcije
  const supabase = await createClient();

  // Vučemo opće riječi iz baze (slično kao u rječniku, ali recimo prvih 100 za vježbu)
  const { data: words, error } = await supabase
    .from('dictionary')
    .select('id, hr_word, translations, image_url, audio_url')
    // Ako imaš kolonu po kojoj razlikuješ opće riječi, ubaci je ovdje
    // npr. .is('job_id', null) 
    .order('hr_word', { ascending: true })
    .limit(100); 

  if (error) {
    console.error("Greška kod učitavanja riječi:", error);
  }

  // Formatiramo za naš Player
  const formattedWords = words ? words.map(w => ({
    id: w.id,
    word_hr: w.hr_word,
    translations: w.translations,
    image_url: w.image_url,
    audio_url: w.audio_url,
  })) : [];

  // ZAPAZI: Ovdje NE šaljemo 'job' prop! Tako će FlashcardPlayer znati da je ovo Opća vježba.
  return (
    <div className="w-full min-h-screen">
      <FlashcardPlayer words={formattedWords} />
    </div>
  );
}