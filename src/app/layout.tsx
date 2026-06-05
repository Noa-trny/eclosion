import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Éclosion — la naissance d'un monde",
  description:
    "Expérience 3D cinématique pilotée par le défilement : du néant à l'aube, huit actes de lumière, de matière et de son — entièrement procédurale.",
  openGraph: {
    title: "Éclosion — la naissance d'un monde",
    description:
      "Une expérience immersive WebGL où le scroll est le temps. Forêt, orage, océan, volcan, aube.",
    locale: "fr_FR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#020308",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
