import { createClient } from "@/utils/supabase/server";
import GrammarClient from "@/components/GrammarClient";

export const revalidate = 0;

export default async function GrammarPage() {
  const supabase = await createClient();

  // Dohvaćamo svu gramatiku iz baze
  const { data: grammarLessons } = await supabase
    .from('grammar_lessons')
    .select('*')
    .order('id', { ascending: true });

  return <GrammarClient lessons={grammarLessons || []} />;
}