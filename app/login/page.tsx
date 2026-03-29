"use client";

import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';

export default function LoginPage() {
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // POMOĆNA FUNKCIJA: Određuje kamo vratiti korisnika
  const getURL = () => {
    let url =
      process?.env?.NEXT_PUBLIC_SITE_URL ?? // Prvo gleda Vercel varijablu
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'); // Onda gleda tvoj preglednik
    
    // Osiguraj da URL završava ispravno za callback
    url = url.endsWith('/') ? url : `${url}/`;
    return `${url}auth/callback`;
  };

  // 1. Funkcija za Magic Link
  const signInWithMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // Koristi našu pametnu funkciju
        emailRedirectTo: getURL(),
      },
    });

    if (error) {
      setMessage({ text: error.message, type: 'error' });
    } else {
      setMessage({ text: 'Poslali smo ti magični link! Provjeri svoj inbox.', type: 'success' });
      setEmail('');
    }
    
    setLoading(false);
  };

  // 2. Funkcija za Google
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Koristi našu pametnu funkciju
        redirectTo: getURL(),
      },
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '1rem',
      backgroundColor: '#e8f4f8'
    }}>
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "url('https://iptiklsbjzrsuyaaytfv.supabase.co/storage/v1/object/public/job-images/dict-1774526952897-yl405.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.45,
        zIndex: 0
      }} />
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.65)',
        zIndex: 1
      }} />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '420px' }}>

      {/* Login kartica */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '420px',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        padding: '2.5rem 2rem',
      }}>
        {/* Logo + naziv */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            background: '#1D9E75',
            borderRadius: '12px',
            marginBottom: '1rem',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>CL</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem' }}>Crolingo</h1>
          <p style={{ fontSize: '0.95rem', color: '#6B7280', margin: 0 }}>Uči hrvatski. Korak po korak.</p>
        </div>

        {/* Poruka (uspjeh/greška) */}
        {message && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '1.25rem',
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          }}>
            {message.text}
          </div>
        )}

        {/* Magic Link forma */}
        <form onSubmit={signInWithMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
            Email adresa
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vas@email.com"
            style={{
              width: '100%',
              padding: '0.65rem 0.875rem',
              borderRadius: '10px',
              border: '1.5px solid #D1D5DB',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#1D9E75')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#D1D5DB')}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? '#a7d9c8' : '#1D9E75',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Slanje linka...' : 'Pošalji magični link ✉'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
          <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 500 }}>ili</span>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
        </div>

        {/* Google gumb */}
        <button
          onClick={signInWithGoogle}
          type="button"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.625rem',
            padding: '0.75rem',
            background: '#fff',
            border: '1.5px solid #D1D5DB',
            borderRadius: '10px',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#374151',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.1H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.9l3.66-2.81z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.1l3.66 2.81c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Nastavi s Googleom
        </button>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF', marginTop: '1.75rem', marginBottom: 0 }}>
          Prijavom prihvaćaš naše{' '}
          <a href="/uvjeti" style={{ color: '#1D9E75', textDecoration: 'none', fontWeight: 500 }}>Uvjete korištenja</a>
          {' '}i{' '}
          <a href="/privatnost" style={{ color: '#1D9E75', textDecoration: 'none', fontWeight: 500 }}>Politiku privatnosti</a>.
        </p>
      </div>
      </div>
    </div>
  );
}