import React from 'react';
import Link from 'next/link';
import MainContent from './MainContent';

interface HomePageProps {
  gold22kt: number;
  gold24kt: number;
  date: string;
}

const fetchGoldData = async (): Promise<HomePageProps> => {
  // let gold995WithGST = null;
  // try {
  //   const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
  //   const res = await fetch(`${backendUrl}/gold_price`);
  //   const data = await res.json();
  //   gold995WithGST = data.find((item: { description: string }) => item.description === 'GOLD 995 WITH GST ');
  // } catch (error) {
  //   console.error('Error fetching gold price data:', error);
  // }

  // const gold24ktPrice = gold995WithGST && !isNaN(parseFloat(gold995WithGST.bid)) ? parseFloat(gold995WithGST.bid) / 10 : 7200;
  // const gold22ktPrice = !isNaN(gold24ktPrice) ? (916 / 995) * gold24ktPrice: 6500;

  // return {
  //   gold22kt: gold22ktPrice,
  //   gold24kt: gold24ktPrice,
  //   date: new Date().toLocaleDateString("en-IN"),
  // };
  
    try {
      const res = await fetch('/api/gold_price');
      return await res.json();
    } catch (error) {
      console.error('Error fetching gold price data:', error);
      return {
        gold22kt: 6500,
        gold24kt: 7200,
        date: new Date().toLocaleDateString("en-IN"),
      };
    }
  };

const HomePage = async () => {
  const data = await fetchGoldData();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Mangalore Jewellery Works</h1>
          <div className="flex items-center gap-2">
            <Link href="#" className="hover:underline" prefetch={false}>
              Contact
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-background text-foreground py-6 px-4 flex flex-col justify-center">
        <MainContent {...data} />
      </main>
      <footer className="bg-muted text-muted-foreground py-2 px-4 flex-col justify-center">
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