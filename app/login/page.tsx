"use client";

import { createClient } from '@/utils/supabase/client';
import { useState } from 'react'; // Dodali smo useState za praćenje upisanog maila i poruka

export default function LoginPage() {
  const supabase = createClient();
  
  // Stanja (states) za našu formu
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // 1. Funkcija za Magic Link
  const signInWithMagicLink = async (e: React.FormEvent) => {
    e.preventDefault(); // Sprječava osvježavanje stranice
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // Kada korisnik klikne na link u mailu, vraćamo ga u našu aplikaciju
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: 'Poslali smo ti magični link! Provjeri svoj inbox (i spam mapu).', type: 'success' });
      setEmail(''); // Očistimo polje
    }
    
    setLoading(false);
  };

  // 2. Funkcija za Google (Ostaje ista)
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Dobrodošli u LearnHR
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Prijavite se za nastavak učenja
          </p>
        </div>

        <div className="mt-8 space-y-6">
          
          {/* Poruke o uspjehu ili grešci */}
          {message && (
            <div className={`p-4 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          {/* MAGIC LINK FORMA */}
          <form onSubmit={signInWithMagicLink} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email adresa</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" 
                placeholder="vas@email.com" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Slanje linka...' : 'Pošalji Magični Link'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Ili nastavite s</span>
            </div>
          </div>

          {/* OŽIVLJENI GOOGLE GUMB */}
          <button
            onClick={signInWithGoogle}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.1H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.9l3.66-2.81z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.1l3.66 2.81c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Prijavi se putem Googlea
          </button>
        </div>
      </div>
    </div>
  );
}