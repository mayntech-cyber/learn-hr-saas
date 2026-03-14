import { supabase } from "@/lib/supabase";
import FlashcardPlayer from "@/components/FlashcardPlayer";

export const revalidate = 0;

export default async function PracticePage({ params }: { params: Promise<{ jobId: string }> }) {
  const resolvedParams = await params;
  const jobId = resolvedParams.jobId;

  // 1. DODANO: Vučemo i 'translations' za posao!
  const { data: job } = await supabase
    .from('jobs')
    .select('id, name_hr, translations, category_id')
    .eq('id', jobId)
    .single();

  const { data: words, error } = await supabase
    .from('dictionary')
    .select('id, hr_word, translations, image_url, audio_url')
    .eq('job_id', jobId)
    .order('id', { ascending: true }); 

  if (error) {
    console.error("Greška kod učitavanja riječi:", error);
  }

  const formattedWords = words ? words.map(w => ({
    id: w.id,
    word_hr: w.hr_word,
    translations: w.translations,
    image_url: w.image_url,
    audio_url: w.audio_url,
  })) : [];

  // Šaljemo formatirane riječi i podatke o poslu klijentu
  return <FlashcardPlayer words={formattedWords} job={job} />;
}