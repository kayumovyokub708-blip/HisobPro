import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HisobPro — Smart Business Management",
  description: "Ҳамаи ҳисобҳои магазин — дар як ҷо. Modern retail management & POS system for Tajikistan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tg" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
