import './globals.css';
import { Inter } from 'next/font/google';
import React from 'react';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next.js + GraphQL demo for Freeform 4 for Craft 4',
  description: 'Next.js + GraphQL demo for Freeform 4 for Craft 4',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
};
