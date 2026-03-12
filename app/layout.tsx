import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blog Post Portal',
  description:
    'Professional and entertaining blog writing portal with SEO scoring, scheduling, autosave drafts, roles, and analytics.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
