import "./globals.css";
import type { Metadata } from "next";
import SplashScreen from "@/components/SplashScreen";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Triage — Automated Bug Triage System",
  description: "Classifies and routes bug reports automatically.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen">
        <SplashScreen />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
