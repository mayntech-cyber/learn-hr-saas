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
    .is('job_id', null)
    .limit(200);

  if (error) {
    console.error("Greška kod učitavanja riječi:", error);
  }

  const shuffled = [...(words || [])].sort(() => Math.random() - 0.5).slice(0, 20);

  // Formatiramo za naš Player
  const formattedWords = shuffled.map(w => ({
    id: w.id,
    word_hr: w.hr_word,
    translations: w.translations,
    image_url: w.image_url,
    audio_url: w.audio_url,
  }));

  // ZAPAZI: Ovdje NE šaljemo 'job' prop! Tako će FlashcardPlayer znati da je ovo Opća vježba.
  return (
    <div className="w-full min-h-screen">
      <FlashcardPlayer words={formattedWords} isGeneral={true} />
    </div>
  );
}