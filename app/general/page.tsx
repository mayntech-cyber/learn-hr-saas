import GeneralHubClient from "@/components/GeneralHubClient";

export const revalidate = 0;

export default async function GeneralHubPage() {
  // Ovdje ne vučemo ništa iz baze za sada jer su kategorije (Rječnik, Scenariji, Vježba) fiksne
  return <GeneralHubClient />;
}