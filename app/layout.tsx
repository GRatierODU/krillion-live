import type { Metadata, Viewport } from "next";
import { Press_Start_2P, Silkscreen } from "next/font/google";
import "./globals.css";

const silkscreen = Silkscreen({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-silkscreen",
  display: "swap",
  preload: false,
});

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Krillion — La plongée illimitée",
  description:
    "Entraînement solo de culture générale : 7 prompts, 25 secondes, les réponses rares font descendre.",
  icons: { icon: "/favicon.svg" },
  appleWebApp: {
    capable: true,
    title: "Krillion",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#163e86",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${silkscreen.variable} ${pressStart.variable} h-full`}
    >
      <body className="min-h-full">
        <noscript>
          <div className="crash-fallback">
            <p className="crash-k">KRILLION</p>
            <h1>Active JavaScript pour plonger.</h1>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
