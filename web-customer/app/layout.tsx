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

export const metadata: Metadata = {
  metadataBase: new URL("https://elshalomstores.com.ng"),
  title: "Elshalom Stores | Everyday finds, beautifully chosen",
  description: "Shop thoughtful home, beauty, gift, and everyday essentials from Elshalom Stores.",
  openGraph: {
    title: "Elshalom Stores | Everyday finds, beautifully chosen",
    description: "Thoughtful home, beauty, gift, and everyday essentials, delivered across Nigeria.",
    images: [{ url: "/elshalom-og.png", width: 1731, height: 909, alt: "A curated collection from Elshalom Stores" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/elshalom-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
