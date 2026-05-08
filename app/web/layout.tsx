import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FieldDriven',
  description: 'AI-first productivity starter app for SaaSathon.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
