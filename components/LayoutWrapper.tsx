"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import { usePageBackground } from "@/hooks/usePageBackground";
import { PAGE_BACKGROUND_OVERLAY } from "@/lib/constants";

// Stranice bez navigacije (imaju vlastiti background)
const NO_NAV_ROUTES = ["/login", "/onboarding"];

// Stranice s navigacijom ali bez background slike (ostaje bg-slate-50)
const NO_BG_ROUTES = ["/pricing/checkout", "/pricing/success"];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bgUrl = usePageBackground();

  const isNoNav = NO_NAV_ROUTES.includes(pathname);
  const isNoBg = NO_BG_ROUTES.includes(pathname);

  const backgroundStyle =
    bgUrl && !isNoBg && !isNoNav
      ? {
          backgroundImage: `linear-gradient(${PAGE_BACKGROUND_OVERLAY}, ${PAGE_BACKGROUND_OVERLAY}), url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }
      : undefined;

  // Login / Onboarding — bez navigacije, vlastiti background
  if (isNoNav) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-center">
        {children}
      </main>
    );
  }

  return (
    <div
      className="flex min-h-screen"
      style={backgroundStyle}
      suppressHydrationWarning
    >
      <Navigation />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 flex flex-col">
        {children}
      </main>
    </div>
  );
}
