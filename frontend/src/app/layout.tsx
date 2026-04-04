"use client";

import React, { ReactNode } from 'react';
import { Raleway } from 'next/font/google';
import { cn } from '../../lib/utils';
import './globals.css';
import Footer from '../components/footer';
import Header from '../components/header';

// Raleway — brand-specified digital font
const fontHeading = Raleway({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
  weight: ['600', '700', '800'],
});

const fontBody = Raleway({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '500'],
});

interface LayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html
      lang="en"
      className={cn(
        'h-full',
        fontHeading.variable,
        fontBody.variable
      )}
    >
      <body className="flex flex-col h-screen overflow-hidden md:overflow-auto">
        <Header />
        <main className="flex-grow overflow-y-auto">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
};

export default RootLayout;
