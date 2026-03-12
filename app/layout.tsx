import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blog Post Portal",
  description:
    "Entertaining yet professional blog portal with writing, scheduling, SEO scoring, autosave, role simulation, and analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
