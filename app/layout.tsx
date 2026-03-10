// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { InitAuth } from "@/components/InitAuth";

export const metadata: Metadata = {
  title: "BetGo - Ruleta Premiada",
  description: "Sistema de entretenimiento para bares - Juega y gana premios",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="font-body" suppressHydrationWarning>
      <body className="antialiased">
        <InitAuth>{children}</InitAuth>
      </body>
    </html>
  );
}
