import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MobileNav from "./mobile-nav";
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
  title: "Yesha Raval",
  description: "Portfolio of Yesha Raval — AI/ML engineer, 3x AWS certified, published researcher. Projects, research, and certifications, filed neatly.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Yesha Raval",
    description: "AI/ML engineer, 3x AWS certified, published researcher. Projects, research, and certifications, filed neatly.",
    url: "https://yesha-raval-portfolio.vercel.app",
    siteName: "Yesha Raval",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Yesha Raval — My work, filed neatly.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yesha Raval",
    description: "AI/ML engineer, 3x AWS certified, published researcher. Projects, research, and certifications, filed neatly.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}<MobileNav /></body>
    </html>
  );
}
