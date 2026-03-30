"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const SESSION_KEY = "page_background_url";

export function usePageBackground(): string | null {
  const [bgUrl, setBgUrl] = useState<string | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      setBgUrl(cached);
      return;
    }

    const supabase = createClient();
    supabase
      .from("page_backgrounds")
      .select("url")
      .eq("active", true)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const random = data[Math.floor(Math.random() * data.length)];
        if (random?.url) {
          sessionStorage.setItem(SESSION_KEY, random.url);
          setBgUrl(random.url);
        }
      });
  }, []);

  return bgUrl;
}
