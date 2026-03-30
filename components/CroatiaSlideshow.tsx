"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

interface CroatiaItem {
  id: string;
  title: string;
  region: string;
  type: string;
  file_url: string;
  did_you_know: Record<string, string> | null;
  is_active: boolean;
  sort_order: number;
}

interface Props {
  language?: string;
  height?: string;
  region?: string;
  className?: string;
}

export default function CroatiaSlideshow({
  language = "en",
  height = "400px",
  region,
  className = "",
}: Props) {
  const [items, setItems] = useState<CroatiaItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function fetchItems() {
      let query = supabase
        .from("croatia_beauty")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (region) query = query.eq("region", region);

      const { data } = await query;
      setItems(data ?? []);
      setLoading(false);
    }
    fetchItems();
  }, [region]);

  const goTo = useCallback(
    (index: number) => {
      if (index === current || fading) return;
      setFading(true);
      setTimeout(() => {
        setCurrent(index);
        setVisible(index);
        setFading(false);
      }, 400);
    },
    [current, fading]
  );

  const next = useCallback(() => {
    if (items.length === 0) return;
    goTo((current + 1) % items.length);
  }, [current, items.length, goTo]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, next, items.length]);

  // Sync visible with current without fade on mount
  useEffect(() => {
    setVisible(current);
  }, []);

  if (loading) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-slate-200 animate-pulse ${className}`}
        style={{ height }}
      >
        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <div className="h-4 bg-slate-300 rounded w-2/3" />
          <div className="h-3 bg-slate-300 rounded w-1/3" />
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-slate-300" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  const item = items[current];
  const didYouKnow =
    item.did_you_know?.[language] ||
    item.did_you_know?.["en"] ||
    null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl select-none ${className}`}
      style={{ height }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Image */}
      <img
        src={item.file_url}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-400"
        style={{ opacity: fading ? 0 : 1 }}
        draggable={false}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 space-y-3">

        {/* Did you know card */}
        {didYouKnow && (
          <div
            className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 transition-opacity duration-400"
            style={{ opacity: fading ? 0 : 1 }}
          >
            <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-1">
              Jeste li znali?
            </p>
            <p className="text-white text-xs leading-relaxed line-clamp-2">
              {didYouKnow}
            </p>
          </div>
        )}

        {/* Title + region */}
        <div
          className="transition-opacity duration-400"
          style={{ opacity: fading ? 0 : 1 }}
        >
          <p className="text-white font-black text-lg md:text-xl leading-tight drop-shadow">
            {item.title}
          </p>
          <p className="text-slate-300 text-xs font-medium mt-0.5 uppercase tracking-wider">
            {item.region}
          </p>
        </div>

        {/* Dot indicators */}
        {items.length > 1 && (
          <div className="flex gap-1.5 justify-center pt-1">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300 focus:outline-none"
                style={{
                  width: i === current ? 20 : 8,
                  height: 8,
                  background: i === current ? "#ffffff" : "rgba(255,255,255,0.4)",
                }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
