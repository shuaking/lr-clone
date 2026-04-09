import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AchievementNotifications } from "@/components/achievement-toast";
import "./globals.css";
export const metadata: Metadata = {
  title: "Language Reactor Clone",
  description: "A near-match starter shell inspired by a language-learning web app."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" richColors />
        <AchievementNotifications />
      </body>
    </html>
  );
}
