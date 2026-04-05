"use client";

import { useEffect, useState } from "react";
import CroatiaSlideshow from "./CroatiaSlideshow";

interface Props {
  language: string;
  bgImages?: string[];
}

const CARD_HEIGHT = "380px";

export default function DashboardSlideshowSection({ language, bgImages = [] }: Props) {
  const [bgIndex, setBgIndex] = useState(0);
  const [bgFading, setBgFading] = useState(false);
  const [mobileActive, setMobileActive] = useState<0 | 1>(0);
  const [mobileFading, setMobileFading] = useState(false);

  // Auto-rotate every 5s with fade
  useEffect(() => {
    if (bgImages.length <= 1) return;
    const id = setInterval(() => {
      setBgFading(true);
      setTimeout(() => {
        setBgIndex((i) => (i + 1) % bgImages.length);
        setBgFading(false);
      }, 400);
    }, 5000);
    return () => clearInterval(id);
  }, [bgImages.length]);

  // Mobile: alternate left/right card every 20s
  useEffect(() => {
    const id = setInterval(() => {
      setMobileFading(true);
      setTimeout(() => {
        setMobileActive((a) => (a === 0 ? 1 : 0));
        setMobileFading(false);
      }, 500);
    }, 20000);
    return () => clearInterval(id);
  }, []);

  const rightCard = (
    <div
      className="relative overflow-hidden rounded-2xl shadow-xl select-none"
      style={{ height: CARD_HEIGHT }}
    >
      {bgImages.length > 0 ? (
        <>
          <img
            src={bgImages[bgIndex]}
            alt="Hrvatska"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: bgFading ? 0 : 1, transition: "opacity 400ms" }}
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div
            className="absolute bottom-5 left-5"
            style={{ opacity: bgFading ? 0 : 1, transition: "opacity 400ms" }}
          >
            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">
              Hrvatska
            </p>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-slate-200 animate-pulse rounded-2xl" />
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:grid md:grid-cols-2 gap-4">
        <CroatiaSlideshow language={language} height={CARD_HEIGHT} className="shadow-xl" />
        {rightCard}
      </div>

      {/* Mobile */}
      <div className="md:hidden relative" style={{ height: CARD_HEIGHT }}>
        <div
          className="absolute inset-0"
          style={{ opacity: mobileActive === 0 && !mobileFading ? 1 : 0, transition: "opacity 500ms" }}
        >
          <CroatiaSlideshow language={language} height={CARD_HEIGHT} className="shadow-xl" />
        </div>
        <div
          className="absolute inset-0"
          style={{ opacity: mobileActive === 1 && !mobileFading ? 1 : 0, transition: "opacity 500ms" }}
        >
          {rightCard}
        </div>
      </div>
    </>
  );
}
