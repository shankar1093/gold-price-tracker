"use client";  // Add this directive at the top if required for client-side features

import React, { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { cn } from '../../lib/utils';
import './globals.css';
import Footer from '../components/footer';
import Header from '../components/header';


const fontHeading = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

const fontBody = Inter({
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