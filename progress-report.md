# User Progress Sustav — Izvještaj (2026-03-29)

---

## 1. BAZA — Tablice za progres

| Tablica | Postoji | Koristi se za |
|---|---|---|
| `profiles` | ✅ | `xp_points`, `streak_days`, `current_job_id`, `onboarding_completed` |
| `user_test_results` | ✅ | `user_id`, `category_id`, `game_type`, `score`, `total_questions`, `accuracy_percentage`, `xp_earned` |
| `word_progress` | ❌ | **Ne postoji** |
| `completed_lessons` | ❌ | **Ne postoji** |

### Sve identificirane tablice

| Tablica | Čitanje | Pisanje |
|---|---|---|
| `profiles` | ✅ | ✅ (onboarding, job selection) |
| `user_test_results` | ✅ | ✅ (samo kviz) |
| `jobs` | ✅ | ❌ |
| `dictionary` | ✅ | ❌ |
| `scenarios` / `scenario_phrases` | ✅ | ❌ |
| `edu_lessons` / `edu_vocabulary` | ✅ | ❌ |
| `subscriptions` | ✅ | ✅ |
| `plan_features` | ✅ | ❌ |
| `languages` / `ui_translations` | ✅ | ❌ |

---

## 2. UČIM/ZNAM gumbi — Sprema li se išta?

**Ne.** Samo lokalni state, nula Supabase poziva.

```typescript
// FlipDictionaryCardJob.tsx i FlipDictionaryCard.tsx
const handleKnown = (e: React.MouseEvent) => {
  e.stopPropagation();
  setStatus("known"); // <-- SAMO STATE, nema .insert() ni .update()
};
```

Nema `word_progress` tablice u bazi — čak i kad bi logika postojala, ne bi imala gdje pisati.

---

## 3. STREAK — Stvarni podatak ili hardkod?

**Poluhardkodirano.** Čita se iz `profiles.streak_days`, ali **nigdje se automatski ne povećava** — nema cron joba, nema logike koja detektira dnevnu aktivnost. Vrijednost je statična u bazi dok je netko ručno ne promijeni.

```typescript
// app/profile/page.tsx
streak: profile?.streak_days || 0,

// DashboardClient.tsx — hardkodirano "5"
<p className="text-xl font-black text-orange-600">5</p>
```

---

## 4. TESTOVI — Sprema li se rezultat?

| Komponenta | Sprema? | Gdje |
|---|---|---|
| `QuizPlayer.tsx` | ✅ Da | `user_test_results` — XP, score, accuracy, game_type |
| `FlashcardPlayer.tsx` | ❌ Ne | — |
| `MatchGamePlayer.tsx` | ❌ Ne | — |
| `ScenarioPlayer.tsx` | ❌ Ne | — |

### QuizPlayer — kako radi

```typescript
// components/QuizPlayer.tsx
const { error } = await supabase
  .from('user_test_results')
  .insert({
    user_id: user.id,
    category_id: lesson.id || null,
    game_type: gameType,       // "ABC_QUIZ_1", "ABC_QUIZ_2", itd.
    score: finalScore,
    total_questions: total,
    accuracy_percentage: accuracy,
    xp_earned: xpEarned        // score * 10
  });
```

### Bonus problem: XP nikad ne dođe na profil

`profiles.xp_points` se **nikada ne ažurira** — kviz sprema XP u `user_test_results.xp_earned`, ali taj iznos se ne pribraja ukupnom `profiles.xp_points`. Profil uvijek prikazuje staru vrijednost iz baze.

---

## 5. Što nedostaje za end-to-end progres

| Stavka | Status | Što treba |
|---|---|---|
| Word progress (Znam/Učim) | ❌ | Nova tablica `word_progress`, logika u `FlipDictionaryCard` |
| Streak auto-increment | ❌ | Supabase Edge Function ili DB trigger koji prati dnevnu aktivnost |
| XP sync na profil | ❌ | Nakon kviza: `profiles.update({ xp_points: +xpEarned })` |
| Flashcard/Match rezultati | ❌ | Dodati `saveResult()` u `FlashcardPlayer` i `MatchGamePlayer` |
| Completed lessons | ❌ | Nova tablica ili flag u `user_test_results` |

**Jedina stvar koja radi end-to-end:** kviz → sprema u `user_test_results` → prikazuje high score.

---

## Struktura projekta (relevantni fileovi)

```
C:\language-front\
├── app/
│   ├── dashboard/page.tsx        # Čita profiles, jobs
│   ├── profile/page.tsx          # Čita & piše profiles
│   ├── quizzes/page.tsx          # Testovi hub
│   ├── general/
│   │   ├── dictionary/           # Rječnik (čita dictionary)
│   │   ├── practice/             # Flashcards
│   │   └── scenarios/            # Scenariji
│   └── learn/[jobId]/
│       ├── dictionary/           # Rječnik po zanimanju
│       ├── practice/             # Vježba po zanimanju
│       └── scenarios/            # Scenariji po zanimanju
├── components/
│   ├── QuizPlayer.tsx            # ✅ Sprema rezultate
│   ├── FlipDictionaryCard*.tsx   # ❌ Gumbi ne spremmaju
│   ├── FlashcardPlayer.tsx       # ❌ Nema spremmanja
│   ├── MatchGamePlayer.tsx       # ❌ Nema spremmanja
│   └── ScenarioPlayer.tsx        # ❌ Nema spremmanja
└── utils/supabase/
    ├── client.ts                 # Browser client (use client komponente)
    └── server.ts                 # Server client (page komponente)
```
