// src/app/page.tsx

import React from 'react';
import Link from 'next/link';
import MyCard from '../components/price_cards';
import TimeseriesChart from '../components/price_series_chart';

interface HomePageProps {
  gold22kt: number;
  gold24kt: number;
  date: string;
}

const fetchGoldData = async (): Promise<HomePageProps> => {
  let gold995WithGST = null;
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
    const res = await fetch(`${backendUrl}/gold_price`); // Ensure the URL is correct and accessible from the server
    const data = await res.json();
    // There is a space in the description string at the end
    gold995WithGST = data.find((item: { description: string }) => item.description === 'GOLD 995 WITH GST ');
    console.log('Gold price data:', gold995WithGST)
  } catch (error) {
    console.error('Error fetching gold price data:', error);
  }

  const gold24ktPrice = gold995WithGST && !isNaN(parseFloat(gold995WithGST.bid)) ? parseFloat(gold995WithGST.bid)/10 : 7200;
  const gold22ktPrice = !isNaN(gold24ktPrice) ? (916 / 995) * gold24ktPrice : 6500;

  return {
    gold22kt: gold22ktPrice,
    gold24kt: gold24ktPrice,
    date: new Date().toLocaleDateString("en-IN"),
  };
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
      <main className="flex-1 bg-background text-foreground py-6 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <MyCard title="22kt Gold Price" price={data?.gold22kt} date={data?.date} />
          <MyCard title="24kt Gold Price" price={data?.gold24kt} date={data?.date} />
        </div>
        <div className="container mx-auto mt-6">
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Gold Price Trends</h2>
            <div className="w-full h-[300px]">
              <TimeseriesChart className="chart" />
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-muted text-muted-foreground py-2 px-4">
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