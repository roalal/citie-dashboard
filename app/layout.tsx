import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const descripcion = "Todo tu evento en una sola App. Escanea el QR del evento y recibe su contenido al instante.";

// Vista previa al compartir cualquier página del panel (WhatsApp, redes).
// La página pública de tarjeta define la suya con la imagen de la tarjeta.
export const metadata: Metadata = {
  metadataBase: new URL("https://citie-dashboard.vercel.app"),
  title: "Chitie",
  description: descripcion,
  openGraph: {
    title: "Chitie",
    description: descripcion,
    siteName: "Chitie",
    locale: "es_MX",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Chitie: todo tu evento en una sola App" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
