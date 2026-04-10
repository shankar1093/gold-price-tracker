import React from 'react';
import './globals.css';
import Footer from '../components/footer';
import Header from '../components/header';
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" style={{ fontFamily: "'Raleway', sans-serif" }}>
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
