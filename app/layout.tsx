import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Language Reactor Clone",
  description: "A near-match starter shell inspired by a language-learning web app.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LR Clone",
  },
};

export const viewport: Viewport = {
  themeColor: "#5b7dd4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
