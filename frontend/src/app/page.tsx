import React from 'react';
import Link from 'next/link';
import MainContent from './MainContent';

interface HomePageProps {
  gold22kt: number;
  gold24kt: number;
  date: string;
}


const HomePage = async () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold py-4">Mangalore Jewellery Works</h1>
          <div className="flex items-center gap-2">
            <Link href="#" className="hover:underline text-2xl" prefetch={false}>
              Contact
            </Link>
          </div>
        </div>
      </header>

      <MainContent gold22kt={0} gold24kt={0} date={new Date().toLocaleDateString("en-IN")} />

      <footer className="bg-muted text-muted-foreground py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <p className="text-xs">&copy; 2024 Mangalore Jewellery Works</p>
          <div className="flex items-center gap-2">
            <Link href="#" className="hover:underline" prefetch={false}>
              Terms of Service
            </Link>
            <Link href="#" className="hover:underline" prefetch={false}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;