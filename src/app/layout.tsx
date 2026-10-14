import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { brandAssets } from "@/lib/brand";
import "./globals.css";

const sans = localFont({
  src: [
    { path: "../../public/fonts/plus-jakarta-sans-400.ttf", weight: "400" },
    { path: "../../public/fonts/plus-jakarta-sans-600.ttf", weight: "600" },
    { path: "../../public/fonts/plus-jakarta-sans-700.ttf", weight: "700" },
  ],
  variable: "--font-blueprint-sans", display: "swap",
});
const display = localFont({ src: "../../public/fonts/syne-700.ttf", weight: "700", variable: "--font-blueprint-display", display: "swap" });

export const metadata: Metadata = {
  title: "HITM Blueprint Studio",
  description: "A deterministic planning studio for Human-in-the-Middle AI-assisted projects.",
  icons: { icon: { url: brandAssets.mark.src, type: "image/png" } },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
