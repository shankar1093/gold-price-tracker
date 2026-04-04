"use client";

import React, { ReactNode } from 'react';
import { Playfair_Display, Lora } from 'next/font/google';
import { cn } from '../../lib/utils';
import './globals.css';
import Footer from '../components/footer';
import Header from '../components/header';

const fontHeading = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

const fontBody = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
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
