import type { Metadata } from 'next';
import type React from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'GreenClaim Lens — Environmental Claim Verification Engine',
  description:
    'Verify commercial green claims against CCPA Greenwashing Guidelines 2024 and Ecomark standards with deterministic rules, risk scoring, and official citations.',
  keywords: ['greenwashing', 'CCPA 2024', 'environmental claims', 'sustainability', 'verification'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
