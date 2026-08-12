import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: {
    default: "Together List — Things We Should Do Together",
    template: "%s | Together List",
  },
  description:
    "Bucket list bareng. Semua ide, rencana, dan mimpi yang mau kita wujudkan bareng.",
  keywords: ["bucket list", "together", "activities", "planning", "couples"],
  authors: [{ name: "xbayz13" }],
  creator: "xbayz13",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://together.xbayz13.xyz",
    title: "Together List — Things We Should Do Together",
    description:
      "Bucket list bareng. Semua ide, rencana, dan mimpi yang mau kita wujudkan bareng.",
    siteName: "Together List",
  },
  twitter: {
    card: "summary_large_image",
    title: "Together List — Things We Should Do Together",
    description:
      "Bucket list bareng. Semua ide, rencana, dan mimpi yang mau kita wujudkan bareng.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF8F0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${nunito.variable} font-sans bg-cream text-textMain antialiased`}>
        {children}
      </body>
    </html>
  );
}
