import { redirect } from "next/navigation";

export default function HomePage() {
  // Automatski preusmjerava korisnika na /dashboard čim otvori početnu stranicu ( / )
  redirect("/dashboard");
}