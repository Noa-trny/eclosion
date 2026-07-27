import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/** Fraunces (OFL, committed in-repo — no runtime network) is the display
 *  voice of the whole experience; system serif remains the metric fallback. */
const display = localFont({
  src: [
    { path: "./fonts/fraunces-latin.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/fraunces-italic-latin.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-display-src",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  title: "Éclosion - la naissance d'un monde",
  description:
    "Expérience 3D cinématique pilotée par le défilement : du néant à l'aube, huit actes de lumière, de matière et de son, entièrement procédurale.",
  openGraph: {
    title: "Éclosion - la naissance d'un monde",
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
    <html lang="fr" className={display.variable}>
      <body>{children}</body>
    </html>
  );
}
