"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const SESSION_KEY = "page_background_url";
const SESSION_EXPIRY_KEY = "page_background_expiry";

export function usePageBackground(): string | null {
  const [bgUrl, setBgUrl] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    if (window.location.pathname === "/dashboard") return null;
    // Prvo provjeri meta tag (server-rendered)
    const bodyUrl = document.body.getAttribute("data-bg-url");
    if (bodyUrl) return bodyUrl;
    // Onda sessionStorage
    const cached = sessionStorage.getItem(SESSION_KEY);
    const expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);
    if (cached && expiry && Date.now() < parseInt(expiry)) return cached;
    return null;
  });

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/dashboard") return;

    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached && cached.startsWith("http")) {
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
