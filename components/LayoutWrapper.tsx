"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Ovdje definiramo na kojim rutama NE ŽELIMO prikazati Sidebar
  const hideNavigationRoutes = ["/login", "/onboarding"];

  // Provjeravamo je li trenutna putanja na "crnoj listi"
  const isNavigationHidden = hideNavigationRoutes.includes(pathname);

  // Ako smo na Login ili Onboarding, prikaži SAMO sadržaj (na sredini, bez margine)
  if (isNavigationHidden) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-center">
        {children}
      </main>
    );
  }

  // Ako smo na bilo kojoj drugoj stranici (Dashboard, General, itd.), prikaži Sidebar + Sadržaj
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Navigation />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 flex justify-center">
        {children}
      </main>
    </div>
  );
}